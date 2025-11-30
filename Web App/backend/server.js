import express from 'express'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

let x = 0
const PORT = process.env.PORT || 3000
// Utiliser l'URL de l'API principale pour l'authentification
const API_CTR_CENTER_URL = process.env.VITE_API_CTR_CENTER_URL || 'https://px-rho.vercel.app'
const API_CTR_CENTER_URL_ENDPOINT = process.env.VITE_API_CTR_CENTER_URL_ENDPOINT
const API_CTR_CENTER_URL_LOCATION_ENDPOINT = process.env.VITE_API_CTR_CENTER_URL_LOCATION_ENDPOINT
const API_CTR_CENTER_URL_CHAT_ENDPOINT = process.env.VITE_API_CTR_CENTER_URL_CHAT_ENDPOINT || '/chat'
const EVENTS_CACHE_TTL_MS = Number(process.env.EVENTS_CACHE_TTL_MS)
// const url = API_CTR_CENTER_URL && API_CTR_CENTER_URL_ENDPOINT
//   ? `${API_CTR_CENTER_URL}${API_CTR_CENTER_URL_ENDPOINT}`
//   : null
const url = API_CTR_CENTER_URL && API_CTR_CENTER_URL_ENDPOINT
  ? `${API_CTR_CENTER_URL}`
  : null

// Cache global pour /api/events/latest (toutes zones)
let eventsCache = {
  data: null,
  lastFetchedAt: 0,
}

if (!API_CTR_CENTER_URL) {
  console.warn(
    '[backend] API_CTR_CENTER_URL is not set. The /api/events/latest endpoint will return a 500 error until it is configured.'
  )
}

const app = express()

app.use(cors())
app.use(express.json())

// Middleware pour extraire le token JWT du header Authorization
app.use((req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extraire le token (enlever "Bearer " du début)
    const token = authHeader.substring(7)
    req.token = token

    console.log(`[backend] Token JWT détecté pour ${req.method} ${req.path}`)
  }

  next()
})

// Middleware de logging simple
app.use((req, res, next) => {
  if (req.path === '/api/ask') {
    console.log(`[backend] ${req.method} ${req.path}`)
  }
  next()
})

app.get('/api/health', (req, res) => {
  console.log('[backend] Health check appelé')
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Endpoint de test pour POST
app.post('/api/test', (req, res) => {
  console.log('[backend] ===== TEST POST =====')
  console.log('[backend] Body reçu:', req.body)
  res.json({
    status: 'ok',
    received: req.body,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/events/latest', async (req, res) => {

  const url = API_CTR_CENTER_URL + API_CTR_CENTER_URL_ENDPOINT

  if (!API_CTR_CENTER_URL) {
    return res.status(500).json({
      error: 'API_CTR_CENTER_URL is not configured on the server',
    })
  }
  console.log('url /api/events/latest: ', url)

  const now = Date.now()
  const isCacheFresh = eventsCache.data && now - eventsCache.lastFetchedAt < EVENTS_CACHE_TTL_MS
  const forceRefresh = req.query?.refresh === 'true'

  if (isCacheFresh && !forceRefresh) {
    console.log('cache hit : ', x++)
    return res.json(eventsCache.data)
  }

  try {
    if (!url) {
      throw new Error('API CTR Center URL is not properly configured')
    }

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })
    eventsCache = {
      data: response.data,
      lastFetchedAt: now,
    }
    console.log('cache miss : ', x++)
    res.json(response.data)
  } catch (error) {
    console.error('[backend] Error fetching /events/latest from CTR Center:', error.message)

    if (eventsCache.data) {
      // Provide last known data to avoid UI breaking when upstream is flaky
      return res.json(eventsCache.data)
    }

    const status = error.response?.status || 500
    res.status(status).json({
      error: 'Failed to fetch events from CTR Center API',
      details: error.message,
    })
  }
})

// GET /zone/:name
app.get('/api/zone/:name', async (req, res) => {
  const zoneName = req.params.name
  const url = API_CTR_CENTER_URL + API_CTR_CENTER_URL_LOCATION_ENDPOINT + '/' + zoneName

  console.log('url /api/zone/:name: ', url, 'zoneName: ', zoneName)
  if (!API_CTR_CENTER_URL) {
    return res.status(500).json({
      error: 'API_CTR_CENTER_URL is not configured on the server',
    })
  }

  const now = Date.now()

  try {
    if (!url) {
      throw new Error('API CTR Center URL is not properly configured')
    }

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })

    // Normaliser la réponse pour le frontend :
    // - forcer le champ "zone" à correspondre à la zone demandée
    // - garantir un objet status et un summary par défaut si absent
    let payload = response.data || {}
    if (typeof payload !== 'object' || Array.isArray(payload)) {
      payload = { raw: payload }
    }

    payload.zone = zoneName
    payload.status = payload.status || {
      urgent: 0,
      pertinent: 0,
      ignored: 0,
    }
    payload.summary =
      payload.summary ||
      `État des lieux — ${zoneName}\n📡 Aucune information disponible pour le moment.`

    console.log('zone fetched from upstream :', zoneName)
    console.log('payload: ', payload)
    res.json(payload)
  } catch (error) {
    console.error('[backend] Error fetching /zone/:name from CTR Center:', error.message)

    const status = error.response?.status || 500
    res.status(status).json({
      error: 'Failed to fetch zone data from CTR Center API',
      details: error.message,
    })
  }
})

// POST /api/ask - Envoyer une question au chat
app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body

  console.log('[backend] POST /api/ask - prompt reçu:', prompt)

  // Validation
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Prompt is required and must be a non-empty string',
    })
  }

  if (!API_CTR_CENTER_URL) {
    return res.status(500).json({
      error: 'API_CTR_CENTER_URL is not configured on the server',
    })
  }

  // Construire l'URL de l'API externe pour le chat
  const chatUrl = `${API_CTR_CENTER_URL}${API_CTR_CENTER_URL_CHAT_ENDPOINT}`

  console.log('[backend] POST /api/ask - prompt:', prompt)
  console.log('[backend] Calling external API:', chatUrl)

  try {
    // Envoyer la requête à l'API externe avec le format { prompt: message }
    const response = await axios.post(chatUrl, {
      prompt: prompt,
    }, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })

    console.log(response)
    // Normaliser la réponse pour le frontend
    const responseData = response.data.answer || {}

    // S'assurer que la réponse a le format attendu
    const normalizedResponse = {
      response: responseData || responseData.message || responseData.text || 'Réponse reçue',
      prompt: prompt,
    }

    console.log('[backend] Response received from external API')
    res.json(normalizedResponse)
  } catch (error) {
    console.error('[backend] Error calling chat API:', error.message)

    const status = error.response?.status || 500
    const errorMessage = error.response?.data?.error || error.message || 'Failed to get response from chat API'

    res.status(status).json({
      error: 'Failed to get response from chat API',
      details: errorMessage,
    })
  }
})

// GET /api/notifications - Récupérer les notifications de l'utilisateur
app.get('/api/notifications', async (req, res) => {
  if (!API_CTR_CENTER_URL) {
    return res.status(500).json({
      error: 'API_CTR_CENTER_URL is not configured on the server',
    })
  }

  // Récupérer les query parameters (avec valeurs par défaut)
  const unreadOnly = req.query.unread_only === 'true' || req.query.unread_only === true
  const limit = parseInt(req.query.limit) || 50

  // Construire l'URL avec les query parameters
  const notificationsUrl = `${API_CTR_CENTER_URL}/notifications?unread_only=${unreadOnly}&limit=${limit}`

  console.log('[backend] GET /api/notifications')
  console.log('[backend] Calling:', notificationsUrl)

  try {
    // Récupérer le token du header Authorization si présent
    const authHeader = req.headers.authorization
    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    }

    // Ajouter le token si présent
    if (authHeader) {
      headers.Authorization = authHeader
      console.log('[backend] Forwarding Authorization header to CTR Center')
    }

    const response = await axios.get(notificationsUrl, { headers })

    console.log('[backend] Notifications received:', response.data)
    res.json(response.data)
  } catch (error) {
    console.error('[backend] Error fetching notifications:', error.message)
    res.status(500).json({ error: 'Failed to fetch notifications from CTR Center API' })
  }
})

// POST /api/login - Login user and save the token in the session
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  // Vérification des champs obligatoires
  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Username and password are required'
    })
  }

  const url = API_CTR_CENTER_URL + '/auth/signin'

  try {
    const response = await axios.post(url, {
      username: username,
      password: password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })

    console.log('[backend] Login successful for user:', username)
    res.json({
      status: 'ok',
      message: 'Login successful',
      token: response.data.token
    })

  } catch (error) {
    console.error('[backend] Login error:', error.message)

    // Gestion des erreurs spécifiques
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      return res.status(error.response.status).json({
        status: 'error',
        message: error.response.data?.message || 'Authentication failed',
        details: error.response.data
      })
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return res.status(503).json({
        status: 'error',
        message: 'Authentication service unavailable',
        details: 'Could not connect to authentication server'
      })
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: error.message
      })
    }
  }
})

// Post /api/signup - Sign up user and save the token in the session
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body
  const url = API_CTR_CENTER_URL + '/auth/signup'

  const userData = {
    username: username,
    email: email,
    password: password,
  }

  const userJsonString = JSON.stringify(userData)

  console.log('Auth URL:', url)
  console.log('Attempting to create user:', { username, email, password })

  try {
    const response = await axios.post(url, userJsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('[backend] Signup successful for user:', username)
    res.json({
      status: 'ok',
      message: 'Signup successful',
      token: response.data.token
    })

  } catch (error) {
    console.error('[backend] Signup error:', error.message)

    // Gestion des erreurs spécifiques
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      return res.status(error.response.status).json({
        status: 'error',
        message: error.response.data?.message || 'Authentication failed',
        details: error.response.data
      })
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return res.status(503).json({
        status: 'error',
        message: 'Authentication service unavailable',
        details: 'Could not connect to authentication server'
      })
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: error.message
      })
    }
  }
})

// POST /api/notifications - Marquer une notification comme lue
app.post('/api/notifications', async (req, res) => {
  if (!API_CTR_CENTER_URL) {
    return res.status(500).json({
      error: 'API_CTR_CENTER_URL is not configured on the server',
    })
  }

  const notificationId = req.body.notificationId

  if (!notificationId) {
    return res.status(400).json({
      status: 'error',
      message: 'notificationId est requis'
    })
  }

  const url = `${API_CTR_CENTER_URL}/notifications/${notificationId}/read`

  console.log('[backend] POST /api/notifications - Marking notification as read')
  console.log('[backend] Notification ID:', notificationId)
  console.log('[backend] Calling:', url)

  try {
    // Récupérer le token du header Authorization si présent
    const authHeader = req.headers.authorization
    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    }

    // Ajouter le token si présent
    if (authHeader) {
      headers.Authorization = authHeader
      console.log('[backend] Forwarding Authorization header to CTR Center')
    } else {
      console.warn('[backend] No Authorization header found')
    }

    const response = await axios.post(url, {}, { headers })

    console.log('[backend] Notification marked as read:', response.data)
    res.json(response.data)

  } catch (error) {
    console.error('[backend] Error marking notification as read:', error.message)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'Erreur lors du marquage de la notification'

      if (status === 401) {
        return res.status(401).json({
          status: 'error',
          message: 'Non autorisé. Veuillez vous connecter.',
          code: 'UNAUTHORIZED'
        })
      } else if (status === 404) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification non trouvée'
        })
      } else {
        return res.status(status).json({
          status: 'error',
          message: message || 'Erreur lors du marquage de la notification'
        })
      }
    } else if (error.request) {
      return res.status(500).json({
        status: 'error',
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      })
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors du marquage de la notification. Veuillez réessayer.'
      })
    }
  }
})

// POST /api/notifications/read-all - Marquer toutes les notifications comme lues
app.post('/api/notifications/read-all', async (req, res) => {
  if (!API_CTR_CENTER_URL) {
    return res.status(500).json({
      error: 'API_CTR_CENTER_URL is not configured on the server',
    })
  }

  const url = `${API_CTR_CENTER_URL}/notifications/read-all`

  console.log('[backend] POST /api/notifications/read-all - Marking all notifications as read')
  console.log('[backend] Calling:', url)

  try {
    // Récupérer le token du header Authorization si présent
    const authHeader = req.headers.authorization
    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    }

    // Ajouter le token si présent
    if (authHeader) {
      headers.Authorization = authHeader
      console.log('[backend] Forwarding Authorization header to CTR Center')
    } else {
      console.warn('[backend] No Authorization header found')
    }

    const response = await axios.post(url, {}, { headers })

    console.log('[backend] All notifications marked as read:', response.data)
    res.json(response.data)

  } catch (error) {
    console.error('[backend] Error marking all notifications as read:', error.message)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'Erreur lors du marquage des notifications'

      if (status === 401) {
        return res.status(401).json({
          status: 'error',
          message: 'Non autorisé. Veuillez vous connecter.',
          code: 'UNAUTHORIZED'
        })
      } else {
        return res.status(status).json({
          status: 'error',
          message: message || 'Erreur lors du marquage des notifications'
        })
      }
    } else if (error.request) {
      return res.status(500).json({
        status: 'error',
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      })
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors du marquage des notifications. Veuillez réessayer.'
      })
    }
  }
})
app.listen(PORT, () => {
  console.log(`[backend] Server listening on port ${PORT}`)
  console.log(`[backend] Health check: http://localhost:${PORT}/api/health`)
  console.log(`[backend] Chat endpoint: http://localhost:${PORT}/api/ask`)
})