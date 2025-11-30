
import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'
import Logo from './Logo'
import NotificationButton from './NotificationButton'
import useSessionTimeout from '../hooks/useSessionTimeout'
import { AlertTriangle } from 'lucide-react'

// Lazy loading des composants lourds
const SidebarPriority = lazy(() => import('./SidebarPriority'))
const MapView = lazy(() => import('./MapView'))
const Chat = lazy(() => import('./Chat'))

class SafeStorage {
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      return false
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }
}


const LoadingSpinner = ({ size = 'md', message = 'Chargement...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full">
      <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${sizes[size]} mb-4`} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Une erreur est survenue
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              L'application a rencontré un problème inattendu. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

const OfflineNotice = () => {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-[3000] mx-auto max-w-md px-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            Vous êtes hors ligne. Certaines fonctionnalités sont limitées.
          </p>
        </div>
      </div>
    </div>
  )
}

const Layout = () => {
  const navigate = useNavigate()
  const logout = useStore((state) => state.logout)
  const user = useStore((state) => state.user)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  
  // États locaux
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isPrioritiesOpen, setIsPrioritiesOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Gestion du timeout de session (5 minutes d'inactivité)
  useSessionTimeout(5)

  // Fonction pour détecter la préférence système
  const getSystemPreference = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Initialiser le mode dark avec détection de préférence système
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false

    // Vérifier si l'utilisateur a déjà fait un choix (saved dans localStorage)
    const savedPreference = SafeStorage.get('darkMode', null)
    
    // Si l'utilisateur a déjà fait un choix, l'utiliser
    if (savedPreference !== null) {
      const isDark = savedPreference === true
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return isDark
    }

    // Sinon, utiliser le mode dark par défaut
    document.documentElement.classList.add('dark')
    return true
  })

  // Écouter les changements de préférence système
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // Fonction pour gérer le changement
    const handleSystemThemeChange = (e) => {
      // Seulement appliquer si l'utilisateur n'a pas fait de choix manuel
      const savedPreference = SafeStorage.get('darkMode', null)
      if (savedPreference === null) {
        // Pas de préférence sauvegardée, suivre le système
        const prefersDark = e.matches
        setIsDarkMode(prefersDark)
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    // Ajouter l'écouteur
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleSystemThemeChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      } else {
        mediaQuery.removeListener(handleSystemThemeChange)
      }
    }
  }, [])

  // Appliquer le thème quand il change
  useEffect(() => {
    const root = document.documentElement

    if (isDarkMode) {
      root.classList.add('dark')
      SafeStorage.set('darkMode', true)
    } else {
      root.classList.remove('dark')
      SafeStorage.set('darkMode', false)
    }
  }, [isDarkMode])

  // Fonction pour basculer le mode sombre/clair
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  // Détection de la taille d'écran (mobile/desktop)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fermer le drawer des priorités lors du passage en mode desktop
  useEffect(() => {
    if (!isMobile) {
      setIsPrioritiesOpen(false)
    }
  }, [isMobile])

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col relative bg-white dark:bg-black transition-all duration-500">
        {/* Notice hors ligne */}
        <OfflineNotice />

        {/* ==========================================
            HEADER avec logo et contrôles
            ========================================== */}
        <div className="h-14 md:h-16 bg-gray-50 dark:bg-black border-b border-emerald-200 dark:border-neon-green/30 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm dark:shadow-neon-green relative z-[4000] overflow-visible">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Logo et titre */}
          <div className="flex items-center gap-2 md:gap-3 relative z-10">
            <div className="transition-transform duration-300 hover:scale-110">
              <Logo width={isMobile ? 28 : 32} height={isMobile ? 28 : 32} />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-emerald-600 dark:text-neon-green uppercase tracking-wider dark:[text-shadow:0_0_10px_rgba(0,255,0,0.5)]">
              Patrol-X
            </h1>
            <div className="hidden md:block px-2 py-1 bg-emerald-50 dark:bg-neon-green/10 border border-emerald-300 dark:border-neon-green/50 text-emerald-700 dark:text-neon-green text-xs font-mono font-semibold rounded uppercase">
              Système Online
            </div>
          </div>

          {/* Contrôles à droite */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Notification Button (only when logged in) */}
            <NotificationButton />

            {/* Bouton toggle dark/light mode */}
            <button
              onClick={toggleDarkMode}
              className="group p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 hover:shadow-md dark:hover:shadow-neon-green"
              aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[-20deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 hover:shadow-md dark:hover:shadow-neon-green"
              aria-label="Déconnexion"
              title={user ? `Déconnexion (${user.name || user.email})` : 'Déconnexion'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Menu burger pour mobile uniquement */}
            {isMobile && (
              <button
                onClick={() => setIsPrioritiesOpen(!isPrioritiesOpen)}
                className="p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 hover:shadow-md dark:hover:shadow-neon-green"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ==========================================
            CONTENU PRINCIPAL
            ========================================== */}
        <div className="flex flex-1 overflow-hidden">

          {/* Desktop: Colonne gauche - État des lieux (toujours visible) */}
          {!isMobile && (
            <div className="w-1/3 lg:w-1/4 border-r border-neon-green/20 bg-gray-50 dark:bg-black">
              <Suspense fallback={<LoadingSpinner message="Chargement..." />}>
                <SidebarPriority onZoneSelect={() => setIsChatOpen(true)} />
              </Suspense>
            </div>
          )}

          {/* Mobile: Panneau État des lieux en drawer (overlay) */}
          {isMobile && isPrioritiesOpen && (
            <>
              {/* Backdrop sombre */}
              <div
                className="fixed inset-0 bg-black/50 z-[2000] transition-opacity"
                onClick={() => setIsPrioritiesOpen(false)}
                aria-label="Fermer le menu"
              />

              {/* Drawer qui slide depuis la gauche */}
              <div
                className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-gray-50 dark:bg-black border-r border-neon-green/30 shadow-neon-green-lg z-[2001] transform transition-transform"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header du drawer */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-neon-green/30 bg-gray-50 dark:bg-black relative overflow-hidden">
                  {/* Subtle grid pattern background */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                  <div className="relative z-10">
                    <h2 className="text-lg font-mono font-bold text-emerald-700 dark:text-neon-green uppercase tracking-wider dark:[text-shadow:0_0_10px_rgba(0,255,0,0.5)]">
                      • État des lieux
                    </h2>
                    <p className="text-xs text-emerald-600/80 dark:text-neon-green/60 mt-0.5 font-mono uppercase">
                      Vue d'ensemble et priorités
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPrioritiesOpen(false)}
                    className="relative z-10 p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50"
                    aria-label="Fermer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Contenu scrollable du drawer */}
                <div className="overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
                  <Suspense fallback={<LoadingSpinner message="Chargement..." />}>
                    <SidebarPriority isMobile={true} onZoneSelect={() => setIsChatOpen(true)} />
                  </Suspense>
                </div>
              </div>
            </>
          )}

          {/* Carte interactive (prend tout l'espace disponible) */}
          <div className="flex-1 relative">
            <Suspense fallback={<LoadingSpinner message="Chargement de la carte..." />}>
              <MapView onZoneSelect={() => setIsChatOpen(true)} />
            </Suspense>


              {/* Bouton flottant pour ouvrir le chat (affiché seulement si le chat est fermé) */}
              {!isChatOpen && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="group fixed md:absolute bottom-8 md:bottom-10 right-6 md:right-6 z-[1001] bg-emerald-50 dark:bg-gray-900/90 border-2 border-emerald-500 dark:border-neon-green/50 text-emerald-600 dark:text-neon-green p-4 rounded-full hover:bg-emerald-100 dark:hover:bg-gray-800 hover:border-emerald-600 dark:hover:border-neon-green transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 backdrop-blur-sm shadow-lg"
                style={{ boxShadow: 'var(--mode) === "dark" ? "0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1)" : "0 4px 20px rgba(16, 185, 129, 0.2)"' }}
                aria-label="Ouvrir le chat"
              >
                {/* Cercle d'onde animé subtil */}
                <div className="absolute inset-0 rounded-full border border-neon-green/30 animate-ping opacity-20" />
                
                {/* Effet de brillance en rotation */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 255, 0, 0.2) 90deg, transparent 180deg)', animation: 'spin 3s linear infinite' }} />

                <svg className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ==========================================
            PANNEAU DE CHAT (overlay)
            ========================================== */}
        {isChatOpen && (
          <>
            {/* Overlay sombre pour mobile */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/50 z-[1999]"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsChatOpen(false)
                }}
                aria-label="Fermer le chat"
              />
            )}

            {/* Panneau chat */}
            <div
              className={`
                fixed z-[2000] bg-white dark:bg-gray-800 shadow-2xl flex flex-col
                ${isMobile
                  ? 'inset-x-0 bottom-0 rounded-t-3xl'
                  : 'top-14 md:top-16 bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 border-l border-gray-200 dark:border-gray-700'
                }
              `}
              style={isMobile ? { height: '90vh', maxHeight: '90vh' } : {}}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Poignée de glissement pour mobile (swipe indicator) */}
              {isMobile && (
                <div className="flex justify-center py-2 bg-white dark:bg-gray-800 rounded-t-3xl">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              )}

              {/* Composant Chat avec lazy loading */}
              <Suspense fallback={<LoadingSpinner message="Chargement du chat..." />}>
                <Chat onClose={() => setIsChatOpen(false)} isMobile={isMobile} />
              </Suspense>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default Layout