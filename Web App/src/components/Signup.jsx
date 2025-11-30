import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../context/store'
import Logo from './Logo'
import { signupUser, getNotifications } from '../api/api'

const Signup = () => {
  const navigate = useNavigate()
  const login = useStore((state) => state.login)
  const setNotifications = useStore((state) => state.setNotifications)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    // Validation côté client
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError({ type: 'error', message: 'Veuillez remplir tous les champs' })
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError({ type: 'error', message: 'Les mots de passe ne correspondent pas' })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères' })
      setIsLoading(false)
      return
    }

    try {
      // Appel à l'API d'inscription
      const response = await signupUser(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password
      )

      // Vérification de la réponse
      if (response && response.status === 'ok') {
        // Afficher un message de succès
        setError({ type: 'success', message: 'Compte créé avec succès ! Connexion...' })

        // Connecter automatiquement l'utilisateur
        login({
          email: formData.email,
          name: formData.name,
        })

        // Récupérer automatiquement les notifications
        try {
          const notifResponse = await getNotifications()
          if (notifResponse.status === 'ok') {
            setNotifications(notifResponse.data)
            console.log('🔔 Notifications chargées:', notifResponse.data)
          }
        } catch (notifError) {
          console.warn('⚠️ Impossible de charger les notifications:', notifError)
          // Ne pas bloquer l'inscription si les notifications échouent
        }

        // Redirection vers la page d'accueil
        setTimeout(() => {
          navigate('/')
        }, 1500)

        return
      }

      // Gestion des erreurs spécifiques
      if (response && response.status === 'error') {
        let errorMessage = 'Erreur lors de la création du compte'

        // Messages d'erreur personnalisés selon le code d'erreur
        if (response.code === 'EMAIL_EXISTS') {
          errorMessage = 'Un compte existe déjà avec cette adresse email'
        } else if (response.code === 'INVALID_EMAIL') {
          errorMessage = 'Veuillez fournir une adresse email valide'
        } else if (response.code === 'WEAK_PASSWORD') {
          errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.'
        } else if (response.message) {
          errorMessage = response.message
        }

        setError({ type: 'error', message: errorMessage })
      } else {
        // Réponse inattendue
        setError({
          type: 'error',
          message: 'Réponse inattendue du serveur. Veuillez réessayer plus tard.'
        })
      }

    } catch (error) {
      // Erreur inattendue
      console.error('Erreur lors de la création de compte:', error)
      setError({
        type: 'error',
        message: 'Une erreur est survenue lors de la création du compte. Veuillez réessayer.'
      })
    } finally {
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
            <p className="text-emerald-600 dark:text-neon-green/70 text-sm font-mono uppercase">Créer un compte</p>
          </div>

          {/* Messages d'état */}
          {error && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm animate-fadeIn ${(typeof error === 'object' ? error.type : 'error') === 'error'
                  ? 'bg-white dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400'
                  : 'bg-white dark:bg-green-500/20 border border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-400'
                }`}
            >
              {typeof error === 'object' ? error.message : error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-emerald-700 dark:text-neon-green/80 mb-2 font-mono uppercase">
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-emerald-300 dark:border-neon-green/30 rounded-lg text-emerald-800 dark:text-white placeholder-emerald-400/60 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-neon-green focus:shadow-md dark:focus:shadow-neon-green transition-all duration-300"
                placeholder="Votre nom"
                required
              />
            </div>

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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-700 dark:text-neon-green/80 mb-2 font-mono uppercase">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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
                  Création...
                </span>
              ) : (
                'Créer un compte'
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-emerald-600 dark:text-neon-green/60 text-sm">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-emerald-700 dark:text-neon-green hover:text-emerald-800 dark:hover:text-neon-green-light font-semibold underline underline-offset-2 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup

