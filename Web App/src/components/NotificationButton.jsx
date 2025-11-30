import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../context/store'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/api'
import { Bell, X, AlertTriangle, MapPin, Radio, Flame, Pin, Moon, CheckCircle2 } from 'lucide-react'

const NotificationButton = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const notifications = useStore((state) => state.notifications)
  const unreadCount = useStore((state) => state.unreadNotificationsCount)
  const setNotifications = useStore((state) => state.setNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const dropdownRef = useRef(null)

  // Charger les notifications au montage uniquement si l'utilisateur est connecté
  useEffect(() => {
    // Ne charger les notifications que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      return
    }

    // Ne charger les notifications que si elles n'ont pas encore été chargées
    // On vérifie si le tableau est vide et qu'on n'a pas encore de count
    const shouldLoad = notifications.length === 0 && unreadCount === 0
    
    if (shouldLoad) {
      const loadNotifications = async () => {
        try {
          console.log('🔔 Chargement des notifications pour l\'utilisateur connecté...')
          const response = await getNotifications()
          
          if (response && response.status === 'ok' && response.data) {
            setNotifications(response.data)
            console.log('🔔 Notifications chargées depuis NotificationButton:', response.data)
            console.log('🔔 Détail des notifications:', response.data.notifications?.map(n => ({
              id: n.id || n._id,
              read: n.read,
              is_read: n.is_read,
              read_at: n.read_at,
              message: n.message?.substring(0, 50),
              allFields: Object.keys(n)
            })))
            // Log de la première notification complète pour voir tous les champs
            if (response.data.notifications && response.data.notifications.length > 0) {
              console.log('🔔 Première notification complète:', response.data.notifications[0])
            }
          } else {
            console.log('🔔 Aucune notification disponible - réponse:', response)
            // Initialiser avec un tableau vide si aucune notification
            setNotifications({ notifications: [], unread_count: 0 })
          }
        } catch (error) {
          console.warn('⚠️ Impossible de charger les notifications:', error)
          // En cas d'erreur, initialiser avec un tableau vide
          setNotifications({ notifications: [], unread_count: 0 })
        }
      }
      
      loadNotifications()
    }
  }, [isAuthenticated, notifications.length, unreadCount, setNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Helper function to format notification time
  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return 'Récemment'
    
    const now = new Date()
    const notificationDate = new Date(createdAt)
    const diffInSeconds = Math.floor((now - notificationDate) / 1000)
    
    if (diffInSeconds < 60) {
      return 'À l\'instant'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Il y a ${minutes} min`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Il y a ${hours}h`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    }
  }

  // Helper function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Check if text should be clickable (long text)
  const isTextLong = (text, maxLength = 100) => {
    if (!text) return false
    return text.length > maxLength
  }

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    if (!notificationId) return
    
    try {
      const response = await markNotificationAsRead(notificationId)
      
      if (response.status === 'ok') {
        // Recharger les notifications pour mettre à jour l'état
        const notifResponse = await getNotifications()
        if (notifResponse.status === 'ok') {
          setNotifications(notifResponse.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error)
    }
  }

  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = async (notification) => {
    const notificationId = notification.id || notification._id
    const isUnread = !notification.read || notification.read === false
    
    // Toujours ouvrir le modal pour afficher la notification complète
    setSelectedNotification(notification)
    
    // Marquer comme lue quand on ouvre le modal
    if (notificationId && isUnread) {
      await markAsRead(notificationId)
    }
  }

  // Fonction pour marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead()
      
      if (response.status === 'ok') {
        // Recharger les notifications pour mettre à jour l'état
        const notifResponse = await getNotifications()
        if (notifResponse.status === 'ok') {
          setNotifications(notifResponse.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative z-[4001]" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 hover:shadow-md dark:hover:shadow-neon-green"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-black animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-black border-2 border-emerald-200 dark:border-neon-green/30 rounded-lg shadow-lg dark:shadow-neon-green-lg z-[4002] animate-scaleIn overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-emerald-200 dark:border-neon-green/20 bg-gray-50/50 dark:bg-black/50 flex items-center justify-between">
            <h3 className="text-emerald-700 dark:text-neon-green font-bold font-mono uppercase tracking-wider text-sm">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-emerald-100 dark:bg-neon-green/20 text-emerald-700 dark:text-neon-green text-xs font-bold rounded">
                {unreadCount} non lues
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-emerald-600 dark:text-neon-green/60 text-sm">
                Aucune notification
              </div>
            ) : (
              <div className="divide-y divide-neon-green/10">
                {notifications.map((notification, index) => {
                  // Vérifier si la notification est non lue
                  // Essayer plusieurs champs possibles : read, is_read, read_at
                  const readValue = notification.read
                  const isReadValue = notification.is_read
                  const readAtValue = notification.read_at
                  
                  // Une notification est non lue si :
                  // - read est explicitement false, 0, null, ou undefined
                  // - is_read est explicitement false
                  // - read_at est null ou undefined (et read n'est pas true)
                  // Si tous les champs sont undefined, utiliser unread_count comme fallback
                  let isUnread = false
                  
                  if (readValue !== undefined) {
                    isUnread = readValue === false || readValue === 0 || readValue === null
                  } else if (isReadValue !== undefined) {
                    isUnread = isReadValue === false
                  } else if (readAtValue !== undefined) {
                    isUnread = readAtValue === null || readAtValue === undefined
                  } else {
                    // Fallback: si tous les champs sont undefined, considérer les X premières comme non lues
                    // où X = unreadCount
                    isUnread = index < unreadCount
                  }
                  
                  const notificationMessage = notification.message || notification.content || notification.text || 'Notification'
                  const notificationTime = notification.created_at || notification.createdAt || notification.time
                  const isLong = isTextLong(notificationMessage)
                  
                  return (
                    <div
                      key={notification.id || notification._id || Math.random()}
                      className={`px-4 py-3 hover:bg-emerald-50 dark:hover:bg-neon-green/5 transition-colors cursor-pointer ${
                        isUnread ? 'bg-cyan-50 dark:bg-cyan-500/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          isUnread ? 'bg-cyan-500 dark:bg-cyan-400 animate-pulse' : 'bg-emerald-400 dark:bg-neon-green/30'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            isUnread ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-emerald-700 dark:text-neon-green/70'
                          }`}>
                            {notificationMessage}
                          </p>
                          {isLong && (
                            <p className="text-xs text-emerald-600 dark:text-neon-green/60 mt-1 font-mono italic">
                              Cliquer pour voir plus
                            </p>
                          )}
                          <p className="text-xs text-emerald-700 dark:text-neon-green/50 mt-1 font-mono">
                            {formatNotificationTime(notificationTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 border-t border-emerald-200 dark:border-neon-green/20 bg-gray-50/50 dark:bg-black/50">
              <button 
                onClick={handleMarkAllAsRead}
                className="w-full text-center text-emerald-700 dark:text-neon-green/70 hover:text-emerald-800 dark:hover:text-neon-green text-xs font-mono uppercase transition-colors"
              >
                Marquer tout comme lu
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal pour afficher la notification complète */}
      {selectedNotification && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-[5000] animate-fadeIn"
            onClick={() => setSelectedNotification(null)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[5001] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="glass-strong border-2 border-emerald-200 dark:border-neon-green/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl dark:shadow-neon-green-lg animate-scaleIn pointer-events-auto bg-white dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-200 dark:border-neon-green/20">
                <h3 className="text-lg font-bold text-emerald-700 dark:text-neon-green font-mono uppercase tracking-wider">
                  Notification
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    !selectedNotification.read || selectedNotification.read === false
                      ? 'bg-cyan-400 animate-pulse' 
                      : 'bg-emerald-400 dark:bg-neon-green/30'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      !selectedNotification.read || selectedNotification.read === false
                        ? 'text-cyan-600 dark:text-cyan-400' 
                        : 'text-emerald-800 dark:text-neon-green/90'
                    }`}>
                      {selectedNotification.message || selectedNotification.content || selectedNotification.text || 'Notification'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-neon-green/50 mt-3 font-mono">
                      {formatNotificationTime(
                        selectedNotification.created_at || 
                        selectedNotification.createdAt || 
                        selectedNotification.time
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationButton

