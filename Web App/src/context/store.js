import { create } from 'zustand'
import { SafeStorage } from '../utils/storage'

// Initialize auth state from localStorage
const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null }
  }
  const savedUser = SafeStorage.get('auth_user', null)
  return {
    isAuthenticated: !!savedUser,
    user: savedUser,
  }
}

const initialAuth = getInitialAuthState()

export const useStore = create((set) => ({
  // Zones sélectionnées (tableau de chaînes)
  selectedZone: [],
  setSelectedZone: (zone) => set((state) => {
    // Si la zone est déjà dans le tableau, ne pas l'ajouter
    if (state.selectedZone.includes(zone)) {
      return state
    }
    // Ajouter la zone au tableau et la définir comme zone active
    return {
      selectedZone: [...state.selectedZone, zone],
      activeZone: zone
    }
  }),
  removeSelectedZone: (zone) => set((state) => {
    const newZones = state.selectedZone.filter(z => z !== zone)
    // Si c'est la dernière zone, réinitialiser les priorités et données
    if (newZones.length === 0) {
      return {
        selectedZone: [],
        activeZone: null,
        priorities: { urgent: 0, pertinent: 0, ignored: 0 },
        zoneData: null
      }
    }
    // Si la zone supprimée était la zone active, mettre à jour l'activeZone
    let newActiveZone = state.activeZone
    if (state.activeZone === zone && newZones.length > 0) {
      newActiveZone = newZones[newZones.length - 1] // Prendre la dernière zone
    } else if (state.activeZone === zone) {
      newActiveZone = null
    }
    return {
      selectedZone: newZones,
      activeZone: newActiveZone
    }
  }),
  clearSelectedZones: () => set({
    selectedZone: [],
    activeZone: null,
    priorities: { urgent: 0, pertinent: 0, ignored: 0 },
    zoneData: null,
    // Note: generalStatus sera rechargé automatiquement par SidebarPriority
    // Réinitialiser zoneData pour que le chat ne garde pas l'ancien état
  }),

  // Zone active actuellement affichée
  activeZone: null,
  setActiveZone: (zone) => set({ activeZone: zone }),

  // Données de la zone
  zoneData: null,
  setZoneData: (data) => set({
    // CORRECTION: Créer un nouvel objet avec timestamp pour forcer la détection de changement
    zoneData: data ? {
      ...data,
      _timestamp: Date.now() // Force la détection de changement
    } : null
  }),

  // État général (pour toutes les zones)
  generalStatus: null,
  setGeneralStatus: (status) => set({ generalStatus: status }),

  // Messages du chat
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setMessages: (messages) => set({ messages }),

  // Priorités
  priorities: {
    urgent: 0,
    pertinent: 0,
    ignored: 0,
  },
  setPriorities: (priorities) => set({ priorities }),

  // État de chargement
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // État de chargement spécifique au chat
  chatLoading: false,

  // Notifications
  notifications: [],
  unreadNotificationsCount: 0,
  setNotifications: (data) => {
    // Gérer la structure de réponse de l'API : {notifications: Array, status: 'ok', unread_count: number}
    console.log('🔔 [Store] setNotifications called with:', data)
    
    const notifications = data?.notifications || (Array.isArray(data) ? data : [])
    const unreadCount = data?.unread_count !== undefined ? data.unread_count : notifications.filter(n => !n.read || n.read === false).length
    
    console.log('🔔 [Store] Setting notifications:', { notifications, unreadCount })
    
    set({
      notifications,
      unreadNotificationsCount: unreadCount
    })
  },
  clearNotifications: () => set({ notifications: [], unreadNotificationsCount: 0 }),
  setChatLoading: (loading) => set({ chatLoading: loading }),

  // État d'authentification
  isAuthenticated: initialAuth.isAuthenticated,
  user: initialAuth.user,
  login: (userData) => {
    SafeStorage.set('auth_user', userData)
    set({
      isAuthenticated: true,
      user: userData
    })
  },
  logout: () => {
    SafeStorage.remove('auth_user')
    sessionStorage.removeItem('token')
    set({
      isAuthenticated: false,
      user: null,
      notifications: [],
      unreadNotificationsCount: 0,
      messages: [],
      selectedZone: [],
      activeZone: null,
      zoneData: null
    })
  },
}))