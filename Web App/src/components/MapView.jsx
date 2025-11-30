import React, { useEffect, useState, memo, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, useMap } from 'react-leaflet'
import { useStore } from '../context/store'
import { getZoneData } from '../api/api'
import { portAuPrinceCommunes, communePolygons } from '../utils/communesData'
import { haitiBounds, defaultCenter, minZoom, maxZoom, defaultZoom } from '../utils/mapBounds'
import L from 'leaflet'

// Fix pour les icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapBoundsController({ selectedZone, activeZone, isMobile }) {
  const map = useMap()

  useEffect(() => {
    map.setMaxBounds(haitiBounds)
    map.setMinZoom(minZoom)
    map.setMaxZoom(maxZoom)

    map.on('drag', () => {
      const currentBounds = map.getBounds()
      if (!currentBounds.intersects(haitiBounds)) {
        map.fitBounds(haitiBounds)
      }
    })

    const zoneToZoom = activeZone || (selectedZone && selectedZone.length > 0 ? selectedZone[selectedZone.length - 1] : null)
    if (zoneToZoom) {
      const commune = portAuPrinceCommunes.find(c => c.name === zoneToZoom)
      if (commune) {
        const zoomLevel = isMobile ? 12 : 13
        map.flyTo(commune.center, zoomLevel, {
          duration: 1,
          maxZoom: maxZoom
        })
      }
    } else {
      map.flyTo(defaultCenter, defaultZoom, {
        duration: 1,
        maxZoom: maxZoom
      })
    }
  }, [selectedZone, activeZone, map, isMobile])

  return null
}

function ForceBounds() {
  const map = useMap()

  useEffect(() => {
    const checkBounds = () => {
      const currentCenter = map.getCenter()
      const currentZoom = map.getZoom()

      if (currentCenter.lat < haitiBounds[0][0] || currentCenter.lat > haitiBounds[1][0] ||
        currentCenter.lng < haitiBounds[0][1] || currentCenter.lng > haitiBounds[1][1]) {
        map.flyTo(defaultCenter, Math.max(currentZoom, minZoom), {
          duration: 1
        })
      }

      if (currentZoom < minZoom) {
        map.setZoom(minZoom)
      } else if (currentZoom > maxZoom) {
        map.setZoom(maxZoom)
      }
    }

    map.on('moveend', checkBounds)
    map.on('zoomend', () => {
      checkBounds()
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    })

    const interval = setInterval(checkBounds, 1000)

    return () => {
      map.off('moveend', checkBounds)
      map.off('zoomend', checkBounds)
      clearInterval(interval)
    }
  }, [map])

  return null
}

const CommunePolygon = memo(({ commune, isSelected, isActive, onClick, isMobile }) => {
  const positions = commune.polygon || communePolygons[commune.id] || [
    [commune.bounds[0][0], commune.bounds[0][1]],
    [commune.bounds[0][0], commune.bounds[1][1]],
    [commune.bounds[1][0], commune.bounds[1][1]],
    [commune.bounds[1][0], commune.bounds[0][1]],
    [commune.bounds[0][0], commune.bounds[0][1]]
  ]

  const getPolygonStyle = useCallback(() => {
    if (isActive) {
      return {
        fillColor: '#00ff00',
        color: '#00ff00',
        weight: 4,
        opacity: 1.0,
        fillOpacity: 0.35,
        dashArray: '0',
        lineCap: 'round',
        lineJoin: 'round'
      }
    }
    
    if (isSelected) {
      return {
        fillColor: commune.color,
        color: '#00ffff',
        weight: 3,
        opacity: 0.95,
        fillOpacity: 0.28,
        dashArray: '0',
        lineCap: 'round',
        lineJoin: 'round'
      }
    }

    return {
      fillColor: commune.color,
      color: commune.color,
      weight: 2,
      opacity: 0.75,
      fillOpacity: 0.18,
      dashArray: '0',
      lineCap: 'round',
      lineJoin: 'round'
    }
  }, [commune.color, isActive, isSelected])

  const handleClick = useCallback(() => {
    onClick(commune.name)
  }, [commune.name, onClick])

  const handleMouseOver = useCallback((e) => {
    if (!isMobile) {
      const layer = e.target
      layer.setStyle({
        weight: 4,
        opacity: 1.0,
        fillOpacity: 0.4,
        color: '#00ffff',
        dashArray: '0'
      })
    }
  }, [isMobile])

  const handleMouseOut = useCallback((e) => {
    if (!isMobile) {
      const layer = e.target
      layer.setStyle(getPolygonStyle())
    }
  }, [isMobile, getPolygonStyle])

  return (
    <Polygon
      positions={positions}
      pathOptions={getPolygonStyle()}
      eventHandlers={{
        click: handleClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut
      }}
      className={`commune-polygon commune-${commune.id} ${isActive ? 'selected-commune' : ''} ${isSelected ? 'selected-commune' : ''}`}
    >
      <Tooltip
        permanent={false}
        direction="center"
        className="commune-tooltip"
        opacity={1}
      >
        <div className="text-center min-w-[120px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/50 rounded-lg p-2 shadow-lg">
          <strong className="text-xs md:text-sm text-cyan-400 font-mono uppercase tracking-wide">{commune.name}</strong>
          <br />
          <span className="text-[10px] md:text-xs text-emerald-400/80 font-mono">
            {commune.population.toLocaleString()} hab.
          </span>
        </div>
      </Tooltip>
    </Polygon>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.commune.id === nextProps.commune.id &&
    prevProps.isMobile === nextProps.isMobile
  )
})

CommunePolygon.displayName = 'CommunePolygon'

const CommuneLabel = memo(({ commune, isMobile }) => {
  return (
    <Marker
      position={commune.center}
      interactive={false}
    />
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.commune.id === nextProps.commune.id &&
    prevProps.isMobile === nextProps.isMobile
  )
})

CommuneLabel.displayName = 'CommuneLabel'

const MapView = ({ onZoneSelect }) => {
  const {
    selectedZone,
    setSelectedZone,
    setZoneData,
    setPriorities,
    setIsLoading,
    activeZone,
    setActiveZone
  } = useStore()

  const [isMobile, setIsMobile] = useState(false)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCommuneClick = useCallback(async (communeName) => {
    // Empêcher les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🚫 Appel ignoré - chargement en cours')
      return
    }

    console.log('🎯 Clic sur zone:', communeName)

    const isAlreadySelected = selectedZone && selectedZone.includes(communeName)

    if (!isAlreadySelected) {
      setSelectedZone(communeName)
    }

    // Définir la zone active
    setActiveZone(communeName)

    // Ouvrir le chat IMMÉDIATEMENT avant de charger les données
    if (onZoneSelect) {
      onZoneSelect()
    }

    // Charger les données
    isLoadingRef.current = true
    setIsLoading(true)

    try {
      console.log('📡 Appel API pour:', communeName)
      const response = await getZoneData(communeName)
      const data = response.data

      setZoneData(data)
      setPriorities(data.status)

    } catch (error) {
      console.error('Error fetching zone data:', error)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [selectedZone, setSelectedZone, setIsLoading, setActiveZone, setZoneData, setPriorities, onZoneSelect])

  return (
    <div className="h-full relative overflow-hidden map-background">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20 animate-pulse" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Header with glassmorphism */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-3 md:px-6 py-3 md:py-4 backdrop-blur-xl bg-gradient-to-r from-slate-900/80 via-cyan-900/50 to-slate-900/80 border-b border-cyan-500/30 shadow-lg shadow-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              <h2 className="text-base md:text-lg font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider font-mono">
                Carte Interactive
              </h2>
            </div>
            <p className="text-xs md:text-sm text-cyan-300/70 mt-0.5 md:mt-1 font-mono uppercase tracking-wide">
              Système Online • Port-au-Prince, HT
            </p>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Map Container with enhanced styling */}
      <div className="h-full pt-16 md:pt-20 pb-2 md:pb-4 px-2 md:px-4 relative">
        <div className="h-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 relative">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-2xl shadow-inner shadow-cyan-500/20 pointer-events-none z-10" />
          
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            maxBounds={haitiBounds}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            scrollWheelZoom={true}
            touchZoom={true}
            dragging={true}
            tap={true}
            bounceAtZoomLimits={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              updateWhenZooming={true}
              updateWhenIdle={true}
            />

            {portAuPrinceCommunes.map(commune => (
              <CommunePolygon
                key={commune.id}
                commune={commune}
                isSelected={selectedZone && selectedZone.includes(commune.name)}
                isActive={activeZone === commune.name}
                onClick={handleCommuneClick}
                isMobile={isMobile}
              />
            ))}

            {portAuPrinceCommunes.map(commune => (
              <CommuneLabel
                key={`label-${commune.id}`}
                commune={commune}
                isMobile={isMobile}
              />
            ))}

            <MapBoundsController
              selectedZone={selectedZone}
              activeZone={activeZone}
              isMobile={isMobile}
            />
            <ForceBounds />
          </MapContainer>
        </div>
      </div>

      {/* Enhanced CTA Button */}
      {/* Afficher le message uniquement si aucune zone n'est sélectionnée et le rendre plus petit */}
      {(!selectedZone || selectedZone.length === 0) && (
        <div className="absolute bottom-8 md:bottom-10 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
          <div className="relative group pointer-events-auto">
            {/* Button compact */}
            <button className="relative mx-4 bg-emerald-50 dark:bg-gray-900/80 border-2 border-emerald-400 dark:border-neon-green/40 rounded-lg px-3 md:px-4 py-2 md:py-2.5 shadow-md dark:shadow-neon-green hover:border-emerald-500 dark:hover:border-neon-green/60 transition-all duration-300">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 dark:text-neon-green/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-xs md:text-sm text-emerald-600 font-bold dark:text-neon-green/80 font-mono uppercase tracking-wider whitespace-nowrap">
                  Cliquez sur une zone
                </p>
              </div>
          </button>
        </div>
        </div>
      )}
    </div>
  )
}
export default MapView