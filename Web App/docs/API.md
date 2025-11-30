# 🔌 Documentation API - Patrol-X

## Vue d'ensemble

L'API Patrol-X est une API RESTful qui sert d'interface entre le frontend React et les services externes (CTR Center). Le backend Express agit comme un proxy avec gestion du cache et forwarding des tokens JWT.

---

## 🌐 Base URL

```
Développement : http://localhost:3000/api
Production    : https://votre-domaine.com/api
```

---

## 🔐 Authentification

### Format

Toutes les requêtes authentifiées nécessitent un token JWT dans le header `Authorization` :

```
Authorization: Bearer <token>
```

### Obtention du token

Le token est obtenu via les endpoints `/api/login` ou `/api/signup` et stocké dans `sessionStorage`.

---

## 📋 Endpoints

### 1. Authentification

#### `POST /api/login`

Connexion d'un utilisateur existant.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "status": "ok",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response Error (401):**
```json
{
  "status": "error",
  "message": "Email ou mot de passe incorrect",
  "code": "UNAUTHORIZED"
}
```

**Codes d'erreur possibles:**
- `401` - Identifiants invalides
- `404` - Utilisateur non trouvé
- `500` - Erreur serveur

---

#### `POST /api/signup`

Inscription d'un nouvel utilisateur.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "status": "ok",
  "message": "Inscription réussie !",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "token": "...",
    "user": {
      "username": "johndoe",
      "email": "user@example.com"
    }
  }
}
```

**Response Error (409):**
```json
{
  "status": "error",
  "message": "Un compte avec cet email existe déjà",
  "code": "SIGNUP_ERROR"
}
```

**Validation frontend:**
- Email valide (format regex)
- Mot de passe minimum 6 caractères
- Tous les champs requis

---

### 2. Notifications

#### `GET /api/notifications`

Récupère les notifications de l'utilisateur authentifié.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `unread_only` (boolean, default: `true`) - Filtrer uniquement les non lues
- `limit` (number, default: `50`) - Nombre maximum de notifications

**Example:**
```
GET /api/notifications?unread_only=true&limit=50
```

**Response Success (200):**
```json
{
  "status": "ok",
  "notifications": [
    {
      "id": 1,
      "message": "Nouvel incident signalé dans la zone Delmas",
      "read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "unread_count": 1
}
```

**Response Error (401):**
```json
{
  "status": "error",
  "message": "Non autorisé. Veuillez vous connecter.",
  "code": "UNAUTHORIZED"
}
```

---

### 3. État général

#### `GET /api/events/latest`

Récupère l'état général de toutes les zones (avec cache).

**Response Success (200):**
```json
{
  "Events": [
    {
      "id": 1,
      "location": "Delmas",
      "priority": "urgent",
      "description": "Incident critique",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Cache:**
- Durée : 5 secondes (configurable via `EVENTS_CACHE_TTL_MS`)
- Stockage : Mémoire serveur
- Invalidation : Automatique après TTL

**Transformation frontend:**
Les données sont transformées dans `api.js` :
```javascript
{
  status: {
    urgent: 3,
    pertinent: 5,
    ignored: 2
  },
  summary: "📊 **État des lieux général...**",
  zones: [...],
  lastUpdate: "2024-01-15T10:30:00Z"
}
```

---

### 4. Données de zone

#### `GET /api/zone/:name`

Récupère les données détaillées d'une zone spécifique.

**Parameters:**
- `name` (string) - Nom de la zone (ex: "Delmas", "Port-au-Prince")

**Example:**
```
GET /api/zone/Delmas
```

**Response Success (200):**
```json
{
  "zone": "Delmas",
  "status": {
    "urgent": 3,
    "pertinent": 5,
    "ignored": 2
  },
  "summary": "🔥 Incidents critiques détectés\n🏃 Mouvement de foule signalé..."
}
```

**Response Error (500):**
En cas d'erreur serveur, le frontend utilise des données mockées (fallback).

**Zones disponibles:**
- Delmas
- Pétion-Ville
- Croix-des-Bouquets
- Carrefour
- Port-au-Prince
- Cité Soleil
- Tabarre

---

### 5. Chat IA

#### `POST /api/ask`

Pose une question à l'assistant IA.

**Request Body:**
```json
{
  "prompt": "Quels sont les incidents urgents à Delmas ?"
}
```

**Response Success (200):**
```json
{
  "response": "Il y a actuellement 3 incidents urgents signalés dans la zone Delmas...",
  "prompt": "Quels sont les incidents urgents à Delmas ?"
}
```

**Response Error:**
En cas d'erreur, le frontend retourne des réponses de fallback basées sur des mots-clés :
- "urgence" / "urgent" → Réponse sur les urgences
- "circulation" / "route" / "trafic" → Réponse sur la circulation
- "sécurité" / "danger" → Réponse sur la sécurité

---

## 🔄 Flux de requêtes

### Exemple : Sélection d'une zone

```
1. User Click (MapView)
   ↓
2. Frontend: getZoneData("Delmas")
   ↓
3. Axios: GET /api/zone/Delmas
   ↓
4. Backend: Proxy vers External API
   ↓
5. External API: GET /api/zone/Delmas
   ↓
6. Response: Zone data
   ↓
7. Backend: Forward response
   ↓
8. Frontend: Update store (setZoneData)
   ↓
9. UI: Display in Chat
```

---

## 🛡️ Gestion d'erreurs

### Structure d'erreur standard

```json
{
  "status": "error",
  "message": "Message d'erreur lisible",
  "code": "ERROR_CODE",
  "details": {} // Optionnel
}
```

### Codes d'erreur

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Token invalide ou manquant |
| `USER_NOT_FOUND` | 404 | Utilisateur non trouvé |
| `NETWORK_ERROR` | - | Erreur de connexion réseau |
| `SERVER_ERROR` | 500 | Erreur serveur interne |
| `SIGNUP_ERROR` | 409 | Email déjà utilisé |
| `MISSING_FIELDS` | 400 | Champs manquants |
| `INVALID_EMAIL` | 400 | Format email invalide |
| `WEAK_PASSWORD` | 400 | Mot de passe trop faible |

### Gestion frontend

Le fichier `utils/errors.js` contient la fonction `handleApiError` :

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    // Erreur avec réponse serveur
    return error.response.data?.message || 'Erreur serveur'
  } else if (error.request) {
    // Pas de réponse reçue
    return 'Impossible de se connecter au serveur'
  } else {
    // Erreur de configuration
    return 'Une erreur est survenue'
  }
}
```

---

## 🔐 Sécurité

### JWT Tokens

- **Stockage** : `sessionStorage` (nettoyé à la fermeture du navigateur)
- **Expiration** : Gérée par le backend
- **Forwarding** : Automatique pour `/api/notifications`

### Intercepteur Axios

```javascript
api.interceptors.request.use((config) => {
  const isNotificationsEndpoint = config.url?.includes('/notifications')
  
  if (isNotificationsEndpoint) {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  
  return config
})
```

### CORS

Le backend Express configure CORS pour autoriser les requêtes depuis le frontend :

```javascript
app.use(cors())
```

---

## 📊 Cache

### Cache des événements

- **Endpoint** : `/api/events/latest`
- **Durée** : 5 secondes (configurable)
- **Stockage** : Mémoire serveur
- **Invalidation** : Automatique après TTL

### Implémentation

```javascript
let eventsCache = {
  data: null,
  lastFetchedAt: 0
}

// Vérification du cache
if (Date.now() - eventsCache.lastFetchedAt < EVENTS_CACHE_TTL_MS) {
  return eventsCache.data
}
```

---

## 🧪 Tests

### Exemples de requêtes

#### Avec cURL

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"password123"}'

# Get Notifications (avec token)
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Zone Data
curl -X GET http://localhost:3000/api/zone/Delmas

# Ask Question
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Quels sont les incidents à Delmas ?"}'
```

#### Avec Axios (Frontend)

```javascript
import { loginUser, getZoneData, askQuestion } from './api/api'

// Login
const response = await loginUser('user@example.com', 'password123')

// Get Zone
const zoneData = await getZoneData('Delmas')

// Ask Question
const answer = await askQuestion('Quels sont les incidents ?')
```

---

## 📝 Notes importantes

### Timeout

- **Timeout par défaut** : 30 secondes
- **Configurable** dans `api.js` : `timeout: 30000`

### Fallback

En cas d'erreur réseau ou serveur, le frontend utilise des données mockées pour :
- `/api/zone/:name` → Données mockées par zone
- `/api/events/latest` → État général par défaut
- `/api/ask` → Réponses basées sur des mots-clés

### Rate Limiting

Actuellement non implémenté. Recommandation : Ajouter rate limiting sur le backend pour protéger contre les abus.

---

## 🔮 Évolutions futures

- [ ] WebSocket pour les notifications en temps réel
- [ ] Pagination pour les notifications
- [ ] Filtres avancés pour les événements
- [ ] Rate limiting
- [ ] Webhooks pour les événements
- [ ] GraphQL API (optionnel)

---

<div align="center">

**API conçue pour la scalabilité et la sécurité**

[Retour au README](../README.md) • [Architecture](./ARCHITECTURE.md) • [Guide de développement](./DEVELOPMENT.md)

</div>

