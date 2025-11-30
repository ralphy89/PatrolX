import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../context/store'
import Logo from './Logo'
import { loginUser, getNotifications } from '../api/api'

const Login = () => {
  const navigate = useNavigate()
  const login = useStore((state) => state.login)
  const setNotifications = useStore((state) => state.setNotifications)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Frontend-only validation
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      setIsLoading(false)
      return
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide')
      setIsLoading(false)
      return
    }

    // Validation de la longueur du mot de passe
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    try {
      // Login user
      const response = await loginUser(formData.email, formData.password)
      console.log('response: ', response)

      if (response && response.status === 'ok') {
        login({
          email: formData.email,
          name: formData.email.split('@')[0],
        })

        // Récupérer automatiquement les notifications après connexion
        try {
          const notifResponse = await getNotifications()
          if (notifResponse.status === 'ok') {
            setNotifications(notifResponse.data)
            console.log('🔔 Notifications chargées:', notifResponse.data)
          }
        } catch (notifError) {
          console.warn('⚠️ Impossible de charger les notifications:', notifError)
          // Ne pas bloquer la connexion si les notifications échouent
        }

        setIsLoading(false)
        navigate('/')
      } else if (response && response.status === 'error') {
        // Afficher l'erreur retournée par l'API
        setError(response.message || 'Erreur lors de la connexion')
        setIsLoading(false)
      } else {
        // Réponse inattendue
        setError('Erreur lors de la connexion. Veuillez réessayer.')
        setIsLoading(false)
      }
    } catch (error) {
      // Erreur inattendue
      console.error('Erreur lors de la connexion:', error)
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-200/40 dark:bg-neon-green/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200/30 dark:bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="border-2 border-emerald-200 dark:border-neon-green/30 rounded-2xl p-8 shadow-xl dark:shadow-neon-green-lg animate-scaleIn bg-emerald-50 dark:bg-gray-900/90">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <Logo width={64} height={64} />
            </div>
            <h1 className="text-3xl font-bold text-emerald-700 dark:text-neon-green uppercase tracking-wider mb-2 dark:[text-shadow:0_0_10px_rgba(0,255,0,0.5)]">
              Patrol-X
            </h1>
            <p className="text-emerald-600 dark:text-neon-green/70 text-sm font-mono uppercase">Connexion</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-white dark:bg-red-500/20 border-2 border-red-300 dark:border-red-500/50 rounded-lg text-red-700 dark:text-red-400 text-sm animate-fadeIn flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Erreur de connexion</p>
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-700 dark:text-neon-green/80 mb-2 font-mono uppercase">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-emerald-300 dark:border-neon-green/30 rounded-lg text-emerald-800 dark:text-white placeholder-emerald-400/60 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-neon-green focus:shadow-md dark:focus:shadow-neon-green transition-all duration-300"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-700 dark:text-neon-green/80 mb-2 font-mono uppercase">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-emerald-300 dark:border-neon-green/30 rounded-lg text-emerald-800 dark:text-white placeholder-emerald-400/60 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-neon-green focus:shadow-md dark:focus:shadow-neon-green transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-100 dark:bg-neon-green/20 border-2 border-emerald-500 dark:border-neon-green text-emerald-700 dark:text-neon-green font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-200 dark:hover:bg-neon-green/30 hover:shadow-md dark:hover:shadow-neon-green-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 dark:focus:ring-neon-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-emerald-500 dark:border-neon-green border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-emerald-600 dark:text-neon-green/60 text-sm">
              Pas encore de compte ?{' '}
              <Link
                to="/signup"
                className="text-emerald-700 dark:text-neon-green hover:text-emerald-800 dark:hover:text-neon-green-light font-semibold underline underline-offset-2 transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

