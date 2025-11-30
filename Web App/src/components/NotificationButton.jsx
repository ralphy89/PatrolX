import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../context/store'
import { getNotifications } from '../api/api'

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative z-[4001]" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neon-green/70 hover:text-neon-green hover:bg-neon-green/10 border border-transparent hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-green/50 hover:shadow-neon-green"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-black animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-black border-2 border-neon-green/30 rounded-lg shadow-neon-green-lg z-[4002] animate-scaleIn overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neon-green/20 bg-black/50 flex items-center justify-between">
            <h3 className="text-neon-green font-bold font-mono uppercase tracking-wider text-sm">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs font-bold rounded">
                {unreadCount} non lues
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-neon-green/60 text-sm">
                Aucune notification
              </div>
            ) : (
              <div className="divide-y divide-neon-green/10">
                {notifications.map((notification) => {
                  const isUnread = !notification.read || notification.read === false
                  const notificationMessage = notification.message || notification.content || notification.text || 'Notification'
                  const notificationTime = notification.created_at || notification.createdAt || notification.time
                  const isLong = isTextLong(notificationMessage)
                  
                  return (
                    <div
                      key={notification.id || notification._id || Math.random()}
                      className={`px-4 py-3 hover:bg-neon-green/5 transition-colors ${
                        isLong ? 'cursor-pointer' : ''
                      } ${
                        isUnread ? 'bg-neon-green/5' : ''
                      }`}
                      onClick={() => {
                        if (isLong) {
                          setSelectedNotification(notification)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          isUnread ? 'bg-neon-green animate-pulse' : 'bg-neon-green/30'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            isUnread ? 'text-neon-green font-semibold' : 'text-neon-green/70'
                          }`}>
                            {isLong ? truncateText(notificationMessage) : notificationMessage}
                          </p>
                          {isLong && (
                            <p className="text-xs text-neon-green/60 mt-1 font-mono italic">
                              Cliquer pour voir plus
                            </p>
                          )}
                          <p className="text-xs text-neon-green/50 mt-1 font-mono">
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
          <div className="px-4 py-2 border-t border-neon-green/20 bg-black/50">
            <button className="w-full text-center text-neon-green/70 hover:text-neon-green text-xs font-mono uppercase transition-colors">
              Voir toutes les notifications
            </button>
          </div>
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
              className="glass-strong border-2 border-neon-green/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-neon-green-lg animate-scaleIn pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neon-green/20">
                <h3 className="text-lg font-bold text-neon-green font-mono uppercase tracking-wider">
                  Notification
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 text-neon-green/70 hover:text-neon-green hover:bg-neon-green/10 border border-transparent hover:border-neon-green/30 rounded-lg transition-all duration-300"
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
                      ? 'bg-neon-green animate-pulse' 
                      : 'bg-neon-green/30'
                  }`} />
                  <div className="flex-1">
                    <p className="text-neon-green/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedNotification.message || selectedNotification.content || selectedNotification.text || 'Notification'}
                    </p>
                    <p className="text-xs text-neon-green/50 mt-3 font-mono">
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

