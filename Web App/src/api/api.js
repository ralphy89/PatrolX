import axios from 'axios'
const API_BASE_URL = import.meta.env.VITE_API_URL + 'api' || 'http://localhost:3000/api'
const CTR_CENTER_ENDPOINT = import.meta.env.VITE_API_CTR_CENTER_URL_ENDPOINT

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10 secondes de timeout
})

// Intercepteur pour ajouter automatiquement le token JWT dans les requêtes
api.interceptors.request.use(
  (config) => {
    // Vérifier si la requête est pour l'endpoint /notifications
    const isNotificationsEndpoint = config.url && config.url.includes('/notifications')

    if (isNotificationsEndpoint) {
      // Récupérer le token du sessionStorage
      const token = sessionStorage.getItem('token')

      // Si un token existe, l'ajouter au header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log(`🔐 [API] Token envoyé pour ${config.method.toUpperCase()} ${config.url}`)
        console.log(`📝 [API] Authorization Header:`, config.headers.Authorization)
      } else {
        console.log(`⚠️ [API] Pas de token disponible pour ${config.method.toUpperCase()} ${config.url}`)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Simuler les réponses en attendant le backend
const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// Données mockées de fallback
const generalDataFallback = {
  status: {
    urgent: 0,
    pertinent: 0,
    ignored: 0,
  },
  summary: `📊 **État des lieux général — Port-au-Prince**\n\n🏛️ **Aucune information disponible pour le moment**\n\n📡 **Dernière mise à jour** : ${new Date().toLocaleString('fr-FR')}\n💬 Posez-moi des questions ou sélectionnez une zone pour plus de détails !`,
  zones: [],
  lastUpdate: new Date().toISOString(),
}

// Fonction pour login user
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password })
    // Save the token in the session
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token)
      console.log('token saved in session: ', response.data.token)
    }
    return {
      status: 'ok',
      data: response.data
    }
  } catch (error) {
    console.error('Error logging in user:', error)

    // Gérer les différents types d'erreurs
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'Erreur de connexion'

      if (status === 401) {
        return {
          status: 'error',
          message: 'Email ou mot de passe incorrect'
        }
      } else if (status === 404) {
        return {
          status: 'error',
          message: 'Utilisateur non trouvé'
        }
      } else {
        return {
          status: 'error',
          message: message || 'Erreur lors de la connexion'
        }
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return {
        status: 'error',
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      }
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return {
        status: 'error',
        message: 'Erreur lors de la connexion. Veuillez réessayer.'
      }
    }
  }
}

// Fonction pour récupérer les notifications
export const getNotifications = async (unreadOnly = true, limit = 50) => {
  try {
    console.log('[API] Fetching notifications:', { unreadOnly, limit })

    const response = await api.get('/notifications', {
      params: {
        unread_only: unreadOnly,
        limit: limit
      }
    })

    console.log('[API] Notifications received:', response.data)

    return {
      status: 'ok',
      data: response.data
    }
  } catch (error) {
    console.error('[API] Error fetching notifications:', error)

    // Gestion des différents types d'erreurs
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'Erreur lors de la récupération des notifications'

      if (status === 401) {
        return {
          status: 'error',
          message: 'Non autorisé. Veuillez vous connecter.',
          code: 'UNAUTHORIZED'
        }
      } else if (status === 404) {
        return {
          status: 'error',
          message: 'Aucune notification trouvée'
        }
      } else {
        return {
          status: 'error',
          message: message || 'Erreur lors de la récupération des notifications'
        }
      }
    } else if (error.request) {
      return {
        status: 'error',
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      }
    } else {
      return {
        status: 'error',
        message: 'Erreur lors de la récupération des notifications. Veuillez réessayer.'
      }
    }
  }
}

// Fonction Signup user using name, email and password
export const signupUser = async (username, email, password) => {
  // Validation des champs obligatoires
  if (!username || !email || !password) {
    return {
      status: 'error',
      message: 'Tous les champs sont obligatoires',
      code: 'MISSING_FIELDS'
    }
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      status: 'error',
      message: 'Veuillez fournir une adresse email valide',
      code: 'INVALID_EMAIL'
    }
  }

  // Validation du mot de passe (au moins 6 caractères)
  if (password.length < 6) {
    return {
      status: 'error',
      message: 'Le mot de passe doit contenir au moins 6 caractères',
      code: 'WEAK_PASSWORD'
    }
  }

  try {
    console.log('Sending signup request with:', { username: username.trim(), email: email.trim().toLowerCase() })
    const response = await api.post('/signup', {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password
    })

    // Vérification de la réponse
    if (response.data && response.data.token) {
      // Sauvegarde du token dans le sessionStorage
      sessionStorage.setItem('token', response.data.token)

      // Journalisation (en mode développement uniquement)
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Inscription réussie pour:', email)
      }

      return {
        status: 'ok',
        message: 'Inscription réussie !',
        data: {
          token: response.data.token,
          user: response.data.user || { username, email } // Inclure les données utilisateur si disponibles
        }
      }
    }

    // Si on arrive ici, il y a un problème avec la réponse
    return {
      status: 'error',
      message: 'Réponse inattendue du serveur',
      code: 'INVALID_RESPONSE'
    }

  } catch (error) {
    console.error('[API] Erreur lors de l\'inscription:', error)

    // Gestion des erreurs spécifiques
    if (error.response) {
      // Erreur avec réponse du serveur
      const { status, data } = error.response

      // Messages d'erreur personnalisés selon le code de statut
      const errorMessages = {
        400: data?.message || 'Données de formulaire invalides',
        409: 'Un compte avec cet email existe déjà',
        500: 'Erreur serveur. Veuillez réessayer plus tard.'
      }

      return {
        status: 'error',
        message: errorMessages[status] || 'Erreur lors de l\'inscription',
        code: data?.code || 'SIGNUP_ERROR',
        details: data?.details
      }
    }

    // Erreur de connexion
    if (error.request) {
      return {
        status: 'error',
        message: 'Impossible de se connecter au serveur',
        code: 'CONNECTION_ERROR'
      }
    }

    // Autres erreurs
    return {
      status: 'error',
      message: 'Une erreur est survenue lors de l\'inscription',
      code: 'UNKNOWN_ERROR',
      details: error.message
    }
  }
}
// Fonction pour transformer les données de l'API au format attendu
const transformApiDataToGeneralStatus = (events) => {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return generalDataFallback
  }

  // Compter les événements par priorité
  let urgent = 0
  let pertinent = 0
  let ignored = 0

  // Grouper par zone
  const zonesMap = new Map()

  events.forEach((event) => {
    // Déterminer la catégorie selon la priorité
    if (event.priority === 'urgent') {
      urgent++
    } else if (event.priority === 'high' || event.priority === 'medium') {
      pertinent++
    } else if (event.priority === 'low') {
      ignored++
    }

    // Grouper par zone (location)
    const zoneName = event.location || 'Général'

    if (!zonesMap.has(zoneName)) {
      zonesMap.set(zoneName, {
        name: zoneName,
        urgent: 0,
        pertinent: 0,
        ignored: 0,
      })
    }

    const zone = zonesMap.get(zoneName)
    if (event.priority === 'urgent') {
      zone.urgent++
    } else if (event.priority === 'high' || event.priority === 'medium') {
      zone.pertinent++
    } else if (event.priority === 'low') {
      zone.ignored++
    }
  })

  // Convertir la Map en tableau et trier par nombre total d'incidents
  const zones = Array.from(zonesMap.values())
    .sort((a, b) => (b.urgent + b.pertinent) - (a.urgent + a.pertinent))

  // Créer un résumé
  const urgentZones = zones
    .filter(z => z.urgent > 0)
    .slice(0, 3)
    .map(z => `${z.name} (${z.urgent} urgent${z.urgent > 1 ? 's' : ''})`)
    .join(', ')

  const summary = `📊 **État des lieux général — Port-au-Prince**\n\n🏛️ **${zones.length} zone${zones.length > 1 ? 's' : ''} surveillée${zones.length > 1 ? 's' : ''}**\n🔥 **${urgent} incident${urgent > 1 ? 's' : ''} urgent${urgent > 1 ? 's' : ''}** signalé${urgent > 1 ? 's' : ''}\n📌 **${pertinent} incident${pertinent > 1 ? 's' : ''} pertinent${pertinent > 1 ? 's' : ''}** en cours\n💤 **${ignored} incident${ignored > 1 ? 's' : ''} ignoré${ignored > 1 ? 's' : ''}**\n\n${urgentZones ? `⚠️ **Zones nécessitant attention** : ${urgentZones}\n\n` : ''}📡 **Dernière mise à jour** : ${new Date().toLocaleString('fr-FR')}\n💬 Posez-moi des questions ou sélectionnez une zone pour plus de détails !`

  return {
    status: {
      urgent,
      pertinent,
      ignored,
    },
    summary,
    zones,
    lastUpdate: new Date().toISOString(),
    rawEvents: events,
  }
}

// GET /events/latest (État général pour toutes les zones)
export const getGeneralStatus = async () => {
  await simulateDelay(800)

  try {
    // On passe maintenant par notre backend (API_BASE_URL) qui proxy les requêtes
    // const response = await api.get(CTR_CENTER_ENDPOINT)
    const response = await api.get('/events/latest')

    const events = response.data?.Events || response.data?.events || response.data || []
    const transformedData = transformApiDataToGeneralStatus(events)
    return { data: transformedData }
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
      console.warn('Erreur CORS ou réseau - utilisation des données mockées')
    } else {
      console.error('Error fetching general status:', error)
    }
    // En cas d’erreur réseau / backend, on revient sur les données mockées
    return { data: generalDataFallback }
  }
}

// GET /zone/:name
export const getZoneData = async (zoneName) => {
  await simulateDelay(800)

  // Simulation de données pour toutes les communes
  const mockData = {
    'Delmas': {
      zone: 'Delmas',
      status: {
        urgent: 3,
        pertinent: 5,
        ignored: 2,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
    'Pétion-Ville': {
      zone: 'Pétion-Ville',
      status: {
        urgent: 1,
        pertinent: 3,
        ignored: 1,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
    'Croix-des-Bouquets': {
      zone: 'Croix-des-Bouquets',
      status: {
        urgent: 2,
        pertinent: 4,
        ignored: 1,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
    'Carrefour': {
      zone: 'Carrefour',
      status: {
        urgent: 4,
        pertinent: 6,
        ignored: 2,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
    'Port-au-Prince': {
      zone: 'Port-au-Prince',
      status: {
        urgent: 5,
        pertinent: 8,
        ignored: 3,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
    'Cité Soleil': {
      zone: 'Cité Soleil',
      status: {
        urgent: 6,
        pertinent: 7,
        ignored: 2,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
    'Tabarre': {
      zone: 'Tabarre',
      status: {
        urgent: 1,
        pertinent: 2,
        ignored: 1,
      },
      summary: `🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé\n🚧 Blocages routiers observés\n📡 Informations en vérification\n💬 Vous pouvez demander : urgences, circulation, sécurité, météo, etc.`,
    },
  }

  // if (mockData[zoneName]) {
  //   return { data: mockData[zoneName] }
  // }

  try {
    const response = await api.get(`/zone/${zoneName}`)
    console.log('endpoint: ', zoneName)
    return { data: response.data }
  } catch (error) {
    console.error('Error fetching zone data:', error)
    return { data: mockData[zoneName] }
  }
  // Fallback pour autres zones
  return {
    data: {
      zone: zoneName,
      status: {
        urgent: 0,
        pertinent: 0,
        ignored: 0,
      },
      summary: `État des lieux — ${zoneName}\n📡 Aucune information disponible pour le moment.`,
    },
  }
}

// POST /ask - Envoyer une question au chat
export const askQuestion = async (prompt) => {
  try {
    // Validation du prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string')
    }

    const trimmedPrompt = prompt.trim()

    // Logs pour déboguer
    console.log('🔍 [API] Configuration:', {
      baseURL: API_BASE_URL,
      endpoint: '/ask',
      fullURL: `${API_BASE_URL}/ask`,
      prompt: trimmedPrompt
    })

    // Envoyer la requête POST au backend avec le format { prompt: message }
    const response = await api.post('/ask', {
      prompt: trimmedPrompt,
    })

    console.log('✅ [API] Réponse reçue:', response.data)

    // Retourner la réponse normalisée
    return {
      data: {
        response: response.data.response || 'Réponse reçue',
        prompt: response.data.prompt || prompt,
      },
    }
  } catch (error) {
    console.error('❌ [API] Error asking question:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        data: error.config?.data
      }
    })

    // En cas d'erreur, retourner une réponse de fallback
    const lowerPrompt = prompt ? prompt.toLowerCase() : ''

    // Réponses de fallback basiques
    if (lowerPrompt.includes('urgence') || lowerPrompt.includes('urgent')) {
      return {
        data: {
          response: `🚨 Informations sur les urgences à Port-au-Prince:\n\n• Données en cours de chargement\n• Veuillez réessayer dans quelques instants`,
          prompt: prompt,
        },
      }
    }

    if (lowerPrompt.includes('circulation') || lowerPrompt.includes('route') || lowerPrompt.includes('trafic')) {
      return {
        data: {
          response: `🚧 État général de la circulation à Port-au-Prince:\n\n• Données en cours de chargement\n• Veuillez réessayer dans quelques instants`,
          prompt: prompt,
        },
      }
    }

    if (lowerPrompt.includes('sécurité') || lowerPrompt.includes('securite') || lowerPrompt.includes('danger')) {
      return {
        data: {
          response: `⚠️ Niveaux de sécurité à Port-au-Prince:\n\n• Données en cours de chargement\n• Veuillez réessayer dans quelques instants`,
          prompt: prompt,
        },
      }
    }

    // Réponse par défaut en cas d'erreur
    return {
      data: {
        response: `⚠️ Désolé, je n'ai pas pu traiter votre question pour le moment. Veuillez réessayer plus tard.\n\nVotre question : "${prompt}"`,
        prompt: prompt,
      },
    }
  }
}


export default api

