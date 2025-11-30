import React, { useEffect, useState } from 'react'
import { useStore } from '../context/store'
import { getZoneData, getGeneralStatus } from '../api/api'

const SidebarPriority = ({ isMobile = false, onZoneSelect }) => {
  const { selectedZone, priorities, removeSelectedZone, clearSelectedZones, activeZone, setActiveZone, setZoneData, setPriorities, setIsLoading, generalStatus, setGeneralStatus, zoneData } = useStore()
  // isDisabled est true si le tableau est vide
  const isDisabled = !selectedZone || selectedZone.length === 0
  // État pour gérer la catégorie sélectionnée pour voir les détails
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Charger l'état général au démarrage et quand aucune zone n'est sélectionnée
  useEffect(() => {
    if (isDisabled) {
      const loadGeneralStatus = async () => {
        setIsLoading(true)
        try {
          const response = await getGeneralStatus()
          const data = response.data
          setGeneralStatus(data)
          setPriorities(data.status)
          // Ne pas mettre à jour zoneData avec l'état général pour que le chat ne l'affiche pas
        } catch (error) {
          console.error('Error fetching general status:', error)
          // En cas d'erreur, getGeneralStatus retourne quand même les données fallback
          // Donc on devrait avoir les données même en cas d'erreur
        } finally {
          setIsLoading(false)
        }
      }
      loadGeneralStatus()
      const interval = setInterval(() => {
        loadGeneralStatus()
        console.log('loadGeneralStatus updated')
      }, 5000)
      return () => clearInterval(interval)

    } else {
      // Réinitialiser l'état général et la catégorie sélectionnée quand une zone est sélectionnée
      setGeneralStatus(null)
      setSelectedCategory(null)
    }
  }, [isDisabled, setGeneralStatus, setPriorities, setIsLoading])

  // Note: Ce useEffect a été désactivé pour éviter les doubles appels
  // Les données sont chargées directement depuis MapView ou handleLoadZoneData
  // useEffect(() => {
  //   // Ne plus charger automatiquement ici pour éviter les doubles appels
  // }, [activeZone, selectedZone, zoneData])

  // Fonction pour charger les données d'une zone spécifique
  const handleLoadZoneData = async (zoneName) => {
    // Ouvrir le chat IMMÉDIATEMENT avant de charger les données
    if (onZoneSelect) {
      onZoneSelect()
    }

    setIsLoading(true)
    setActiveZone(zoneName)

    try {
      const response = await getZoneData(zoneName)
      const data = response.data

      setZoneData(data)
      setPriorities(data.status)
    } catch (error) {
      console.error('Error fetching zone data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    {
      emoji: '🔥',
      label: 'Urgent',
      count: priorities.urgent,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      priority: 'urgent',
    },
    {
      emoji: '📌',
      label: 'Pertinent',
      count: priorities.pertinent,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      priority: 'pertinent', // high ou medium
    },
    {
      emoji: '💤',
      label: 'Ignoré',
      count: priorities.ignored,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      priority: 'ignored', // low
    },
  ]

  // Filtrer les événements selon la catégorie sélectionnée
  const getFilteredEvents = (category) => {
    if (!generalStatus?.rawEvents || !Array.isArray(generalStatus.rawEvents)) {
      return []
    }

    return generalStatus.rawEvents.filter((event) => {
      if (category.priority === 'urgent') {
        return event.priority === 'urgent'
      } else if (category.priority === 'pertinent') {
        return event.priority === 'high' || event.priority === 'medium'
      } else if (category.priority === 'ignored') {
        return event.priority === 'low'
      }
      return false
    })
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-neon-green/30 shrink-0">
        <h2 className="text-base md:text-lg font-mono font-bold text-neon-green uppercase tracking-wider" style={{ textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>
          {isDisabled
            ? '• CENTRE DE CONTRÔLE'
            : activeZone
              ? `• CARTE INTERACTIVE`
              : '• CARTE INTERACTIVE'
          }
        </h2>
        <p className="text-xs text-neon-green/60 mt-1 font-mono uppercase">
          {isDisabled ? 'Système Online | Port-au-Prince, HT' : `Zone: ${activeZone}`}
        </p>

        {/* AFFICHAGE DES ZONES (CHIPS/TAGS) */}
        {selectedZone && selectedZone.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 animate-fadeIn">
            {selectedZone.map((zone, index) => {
              const isActive = activeZone === zone
              return (
                <div
                  key={`${zone}-${index}`}
                  onClick={() => handleLoadZoneData(zone)}
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-all duration-300 cursor-pointer ${isActive
                    ? 'bg-neon-green/20 text-neon-green border-neon-green shadow-neon-green scale-105'
                    : 'glass text-neon-green/70 border-neon-green/30 hover:border-neon-green/50 hover:shadow-neon-green hover:scale-105 active:scale-95'
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span>{zone}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedZone.length === 1) {
                        clearSelectedZones()
                      } else {
                        removeSelectedZone(zone)
                      }
                    }}
                    className={`ml-0.5 p-0.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neon-green ${isActive
                      ? 'text-neon-green hover:bg-neon-green/20'
                      : 'text-neon-green/70 hover:text-neon-green hover:bg-neon-green/10'
                      }`}
                    aria-label={`Retirer ${zone}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}


      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
        {isDisabled ? (
          <>
            {/* Statistiques générales */}
            <div className="space-y-3 md:space-y-4">
              {categories.map((category, index) => {
                const filteredEvents = getFilteredEvents(category)
                const isSelected = selectedCategory === category.priority

                // Gradients personnalisés selon la catégorie
                const categoryGradient = category.priority === 'urgent'
                  ? 'bg-black'
                  : category.priority === 'pertinent'
                    ? 'bg-black'
                    : 'bg-black'

                const borderColor = category.priority === 'urgent'
                  ? 'border-neon-orange'
                  : category.priority === 'pertinent'
                    ? 'border-neon-pink'
                    : 'border-gray-600'

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (category.count > 0) {
                        setSelectedCategory(isSelected ? null : category.priority)
                      }
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${categoryGradient} glass animate-fadeIn hover:-translate-y-1 ${category.count > 0
                      ? `cursor-pointer active:scale-[0.98] hover:shadow-neon-green ${borderColor}${isSelected ? ' ring-2 ring-neon-green shadow-neon-green-lg' : ''}`
                      : 'cursor-default opacity-50 border-gray-700'
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Effet de brillance au hover */}
                    {category.count > 0 && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
                          {category.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-sm md:text-base text-neon-green uppercase font-mono tracking-wide">
                            {category.label}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">
                            {category.count === 0 && 'Aucun incident'}
                            {category.count === 1 && `${category.count} incident`}
                            {category.count > 1 && `${category.count} incidents`}
                          </div>
                        </div>
                      </div>
                      <div className={`text-3xl md:text-4xl font-bold transition-all duration-300 ${category.priority === 'urgent' ? 'text-neon-orange' : category.priority === 'pertinent' ? 'text-neon-pink' : 'text-gray-500'} group-hover:scale-110`}>
                        {category.count}
                      </div>
                    </div>

                    {/* Afficher les détails si la catégorie est sélectionnée */}
                    {isSelected && filteredEvents.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Détails des incidents ({filteredEvents.length})
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCategory(null)
                            }}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            Fermer
                          </button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {filteredEvents.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-semibold text-xs text-gray-900 dark:text-white mb-1">
                                    📍 {event.location || 'Général'}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {event.event_type && (
                                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
                                        {event.event_type}
                                      </span>
                                    )}
                                    {event.severity && (
                                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${event.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                        event.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {event.severity}
                                      </span>
                                    )}
                                    {event.probability && (
                                      <span className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                                        {Math.round(event.probability * 100)}% probabilité
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                                {event.summary}
                              </p>
                              {event.recommended_action && (
                                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  💡 <strong>Action recommandée :</strong> {event.recommended_action}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                {event.timestamp_start && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    📅 {new Date(event.timestamp_start).toLocaleString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                                {event.sources_count && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    📡 {event.sources_count} source{event.sources_count > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Liste des zones avec statistiques */}
            {generalStatus && generalStatus.zones && generalStatus.zones.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neon-green/30">
                <h4 className="text-xs font-bold text-neon-green mb-3 uppercase tracking-wider font-mono">
                  •• DÉTAILS PAR ZONE
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {generalStatus.zones
                    .sort((a, b) => (b.urgent + b.pertinent) - (a.urgent + a.pertinent)) // Trier par nombre d'incidents
                    .map((zone, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg glass border border-neon-green/20 hover:border-neon-green/40 transition-colors"
                      >
                        <span className="text-xs font-medium text-neon-green/80 font-mono">
                          {zone.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {zone.urgent > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-neon-orange/20 border border-neon-orange text-neon-orange text-xs font-semibold font-mono">
                              🔥{zone.urgent}
                            </span>
                          )}
                          {zone.pertinent > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-neon-pink/20 border border-neon-pink text-neon-pink text-xs font-semibold font-mono">
                              📌{zone.pertinent}
                            </span>
                          )}
                          {zone.ignored > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              💤{zone.ignored}
                            </span>
                          )}
                          {zone.urgent === 0 && zone.pertinent === 0 && zone.ignored === 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              Aucun incident
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Message de chargement */}
            {!generalStatus && (
              <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-xs">Chargement des statistiques générales...</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {categories.map((category, index) => {
              // Pour les zones sélectionnées, on peut aussi afficher les détails si on a les rawEvents
              // Pour l'instant, on garde juste le style cliquable
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : `${category.bgColor} dark:bg-gray-700/50 ${category.borderColor} dark:border-gray-600 hover:shadow-md dark:hover:shadow-gray-900/50 cursor-pointer active:scale-[0.98]`
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.emoji}</div>
                      <div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">
                          {category.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {category.count === 0 && 'Aucun incident'}
                          {category.count === 1 && '1 incident'}
                          {category.count > 1 && `${category.count} incidents`}
                        </div>
                      </div>
                    </div>
                    <div className={`text-2xl md:text-3xl font-bold ${category.color}`}>
                      {category.count}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarPriority
