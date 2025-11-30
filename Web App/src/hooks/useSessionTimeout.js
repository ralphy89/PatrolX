import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'

/**
 * Hook pour gérer le timeout de session après une période d'inactivité
 * @param {number} timeoutMinutes - Temps d'inactivité en minutes avant déconnexion (par défaut 5 minutes)
 */
const useSessionTimeout = (timeoutMinutes = 5) => {
  const navigate = useNavigate()
  const logout = useStore((state) => state.logout)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const timeoutRef = useRef(null)
  
  // set timeout at 5 minutes before logout
  const timeoutDuration = 5 * 60 * 1000 //timeoutMinutes * 60 * 1000 // Convertir en millisecondes

  const resetTimeout = useCallback(() => {
    // Nettoyer le timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Ne créer un nouveau timeout que si l'utilisateur est authentifié
    if (isAuthenticated) {
      // Créer un nouveau timeout
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Session expirée - déconnexion automatique après inactivité')
        logout()
        navigate('/login', { replace: true })
      }, timeoutDuration)
    }
  }, [isAuthenticated, logout, navigate, timeoutDuration])

  useEffect(() => {
    // Ne faire fonctionner le timeout que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Événements qui réinitialisent le timeout
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Initialiser le timeout
    resetTimeout()

    // Ajouter les écouteurs d'événements
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, true)
    })

    // Nettoyer lors du démontage ou changement d'état
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout, true)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isAuthenticated, resetTimeout])

  return { resetTimeout }
}

export default useSessionTimeout

