import React, { useState, useEffect } from 'react'
import { getNotifications } from '../api/api'

const NotificationsExample = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [unreadOnly, setUnreadOnly] = useState(true)
    const [limit, setLimit] = useState(50)

    const fetchNotifications = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await getNotifications(unreadOnly, limit)

            if (result.status === 'ok') {
                setNotifications(result.data)
                console.log('✅ Notifications chargées:', result.data)
            } else {
                setError(result.message)
                console.error('❌ Erreur:', result.message)
            }
        } catch (err) {
            setError('Une erreur inattendue est survenue')
            console.error('❌ Erreur inattendue:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Charger les notifications au montage du composant
        fetchNotifications()
    }, [])

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-neon-green mb-8 uppercase tracking-wider">
                    🔔 Notifications
                </h1>

                {/* Controls */}
                <div className="glass-strong border border-neon-green/30 rounded-lg p-6 mb-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neon-green/80 mb-2 font-mono uppercase">
                                Limite
                            </label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-black/50 border border-neon-green/30 rounded-lg text-white focus:outline-none focus:border-neon-green"
                                min="1"
                                max="100"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="unreadOnly"
                                checked={unreadOnly}
                                onChange={(e) => setUnreadOnly(e.target.checked)}
                                className="w-5 h-5 rounded border-neon-green/30 bg-black/50"
                            />
                            <label htmlFor="unreadOnly" className="text-neon-green/80 font-mono text-sm uppercase">
                                Non lues uniquement
                            </label>
                        </div>

                        <button
                            onClick={fetchNotifications}
                            disabled={loading}
                            className="px-6 py-2 bg-neon-green/20 border-2 border-neon-green text-neon-green font-bold uppercase tracking-wider rounded-lg hover:bg-neon-green/30 hover:shadow-neon-green-lg transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Chargement...' : 'Actualiser'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Notifications List */}
                <div className="glass-strong border border-neon-green/30 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-neon-green mb-4 uppercase tracking-wider">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                                Chargement...
                            </span>
                        ) : (
                            `${notifications.length || 0} notification${notifications.length > 1 ? 's' : ''}`
                        )}
                    </h2>

                    {!loading && notifications.length === 0 ? (
                        <p className="text-neon-green/60 text-center py-8">
                            Aucune notification disponible
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification, index) => (
                                <div
                                    key={notification.id || index}
                                    className="bg-black/30 border border-neon-green/20 rounded-lg p-4 hover:border-neon-green/50 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-white font-semibold">
                                            {notification.title || 'Sans titre'}
                                        </h3>
                                        {notification.read === false && (
                                            <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded uppercase">
                                                Nouveau
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-neon-green/70 text-sm mb-2">
                                        {notification.message || notification.content || 'Pas de message'}
                                    </p>
                                    <div className="flex justify-between items-center text-xs text-neon-green/50">
                                        <span>{notification.type || 'Info'}</span>
                                        <span>
                                            {notification.created_at
                                                ? new Date(notification.created_at).toLocaleString('fr-FR')
                                                : 'Date inconnue'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Debug Info */}
                <div className="mt-6 glass-strong border border-neon-green/20 rounded-lg p-4">
                    <p className="text-neon-green/60 text-xs font-mono">
                        💡 Tip: Ouvrez la console du navigateur (F12) pour voir les logs détaillés des requêtes API
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NotificationsExample
