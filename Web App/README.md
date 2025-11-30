# Patrol-X - Système de Surveillance en Temps Réel

<div align="center">

![Patrol-X Logo](public/assets/logo.svg)

**Système de surveillance et d'analyse en temps réel pour Port-au-Prince, Haïti**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Zustand-4.4.7-FF6B6B)](https://zustand-demo.pmnd.rs/)

[Documentation](#-documentation) • [Installation](#-installation) • [Architecture](#-architecture) • [API](#-api)

</div>

---

## Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Démarrage](#-démarrage)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Documentation](#-documentation)
- [Structure du projet](#-structure-du-projet)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Déploiement](#-déploiement)

---

## Vue d'ensemble

**Patrol-X** est une application web moderne de surveillance et d'analyse en temps réel conçue pour surveiller les zones de Port-au-Prince, Haïti. L'application offre une interface intuitive avec cartographie interactive, chat IA, système de notifications et gestion des priorités d'incidents.

### Caractéristiques principales

- **Cartographie interactive** avec React Leaflet
- **Chat IA conversationnel** pour l'analyse de données
- **Système de notifications** en temps réel
- **Authentification sécurisée** avec JWT
- **Tableau de bord** avec priorités dynamiques
- **Mode clair/sombre** adaptatif
- **Design responsive** mobile-first
- **Performance optimisée** avec lazy loading

---

## Fonctionnalités

### Cartographie

- **7 communes de Port-au-Prince** avec polygones colorés
- **Sélection interactive** des zones par clic
- **Zoom automatique** sur la zone sélectionnée
- **Labels dynamiques** avec informations démographiques
- **Limites géographiques** strictes (Haïti uniquement)
- **Animations fluides** et effets visuels

### Chat IA

- **Assistant IA** pour l'analyse de données
- **Messages contextuels** basés sur la zone sélectionnée
- **Typing effect** pour une expérience naturelle
- **Support Markdown** pour le formatage
- **Historique des conversations**
- **Mode hors ligne** avec indication visuelle

### Notifications

- **Notifications en temps réel** avec badge de compteur
- **Messages longs** avec modal de lecture
- **Marquage lu/non lu** automatique
- **Filtrage par statut** (toutes/non lues)
- **Horodatage relatif** (il y a X min/h/jour)

### 🔐 Authentification

- **Connexion** avec email/mot de passe
- **Inscription** avec validation frontend
- **Session timeout** (5 minutes d'inactivité)
- **Protection des routes** avec React Router
- **Stockage sécurisé** avec SafeStorage

### Tableau de bord

- **Priorités dynamiques** : Urgent, Pertinent, Ignoré
- **État général** de toutes les zones
- **Vue détaillée** par zone sélectionnée
- **Statistiques en temps réel**
- **Mise à jour automatique** toutes les 5 secondes

### Interface utilisateur

- **Thème néon** avec effets lumineux
- **Mode clair/sombre** avec détection système
- **Animations fluides** avec Framer Motion
- **Design glassmorphism** moderne
- **Responsive design** mobile/tablette/desktop

---

## Installation

### Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 ou **yarn** >= 1.22.0

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone https://github.com/noelRockson/patrol-x.git
cd patrol-x
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_CTR_CENTER_URL=https://px-rho.vercel.app
VITE_API_CTR_CENTER_URL_ENDPOINT=/api/events/latest
VITE_API_CTR_CENTER_URL_LOCATION_ENDPOINT=/api/zone
VITE_API_CTR_CENTER_URL_CHAT_ENDPOINT=/chat

# Backend Configuration (optionnel)
PORT=3000
EVENTS_CACHE_TTL_MS=5000
```

4. **Démarrer le serveur de développement**

```bash
# Terminal 1 : Frontend
npm run dev

# Terminal 2 : Backend (optionnel)
npm run server
```

L'application sera accessible sur `http://localhost:5173`

---

## 🏗️ Architecture

### Architecture générale

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   App    │──│  Layout  │──│  Routes  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│       │             │                                      │
│  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐                 │
│  │  Store  │  │  MapView │  │  Chat   │                 │
│  │(Zustand)│  │ (Leaflet)│  │   (IA)   │                 │
│  └────┬────┘  └────┬────┘  └────┬────┘                 │
└───────┼─────────────┼─────────────┼───────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
              ┌───────▼────────┐
              │   API Client   │
              │    (Axios)     │
              └───────┬────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌────────▼────────┐
│  Backend Proxy │        │  External API   │
│   (Express)   │───────▶  (CTR Center)     │
└────────────────┘        └─────────────────┘
```

### Flux de données

1. **Authentification** : Login → JWT Token → Session Storage
2. **Sélection de zone** : Clic sur carte → API Call → Store Update → Chat Update
3. **Notifications** : WebSocket/Polling → Store Update → UI Update
4. **Chat IA** : Message utilisateur → API Call → Réponse IA → Store Update

---

## Technologies

### Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **React** | 18.2.0 | Framework UI |
| **Vite** | 5.0.8 | Build tool & Dev server |
| **React Router** | 7.9.6 | Routing & Navigation |
| **Zustand** | 4.4.7 | State management |
| **TailwindCSS** | 3.3.6 | Styling |
| **React Leaflet** | 4.2.1 | Cartographie |
| **Axios** | 1.6.2 | HTTP Client |
| **Framer Motion** | 10.16.16 | Animations |

### Backend

| Technologie | Version | Usage |
|------------|---------|-------|
| **Express** | 4.21.2 | Server framework |
| **Axios** | 1.6.2 | HTTP Client |
| **CORS** | 2.8.5 | Cross-origin requests |
| **dotenv** | 17.2.3 | Environment variables |

### Outils de développement

- **ESLint** - Linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## Documentation

### Documentation complète

- [**API.md**](./docs/API.md) - Documentation complète de l'API

### Guides rapides

- [Installation rapide](#-installation)
- [Configuration](#-configuration)
- [Déploiement](#-déploiement)

---

## 📂 Structure du projet

```
patrol-x/
├── backend/                 # Serveur Express (proxy API)
│   └── server.js           # Configuration serveur
├── public/                  # Assets statiques
│   └── assets/
│       └── logo.svg        # Logo Patrol-X
├── src/
│   ├── api/                # Couche API
│   │   └── api.js          # Client Axios & endpoints
│   ├── components/         # Composants React
│   │   ├── Layout.jsx      # Layout principal
│   │   ├── MapView.jsx     # Carte interactive
│   │   ├── Chat.jsx        # Interface chat
│   │   ├── ChatMessage.jsx # Composant message
│   │   ├── SidebarPriority.jsx # Sidebar priorités
│   │   ├── NotificationButton.jsx # Bouton notifications
│   │   ├── Login.jsx       # Page de connexion
│   │   ├── Signup.jsx      # Page d'inscription
│   │   └── ...             # Autres composants
│   ├── context/            # State management
│   │   └── store.js        # Store Zustand
│   ├── hooks/              # Hooks personnalisés
│   │   ├── useDebounce.js  # Debounce hook
│   │   ├── useOnlineStatus.js # Statut en ligne
│   │   ├── useSessionTimeout.js # Timeout session
│   │   └── useTypingEffect.js # Effet de frappe
│   ├── utils/              # Utilitaires
│   │   ├── storage.js      # SafeStorage wrapper
│   │   ├── errors.js       # Gestion d'erreurs
│   │   ├── communesData.js # Données géographiques
│   │   ├── mapBounds.js    # Limites de carte
│   │   └── markdown.jsx    # Parser Markdown
│   ├── styles/              # Styles CSS
│   │   └── leaflet.css     # Styles Leaflet
│   ├── App.jsx              # Composant racine
│   ├── main.jsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── .env                     # Variables d'environnement
├── .gitignore               # Fichiers ignorés
├── package.json             # Dépendances
├── tailwind.config.js       # Config Tailwind
├── vite.config.js           # Config Vite
└── README.md                # Ce fichier
```

---

## Configuration

### Variables d'environnement

#### Frontend (`.env`)

```env
# URL de l'API backend
VITE_API_URL=http://localhost:3000

# URL de l'API externe (CTR Center)
VITE_API_CTR_CENTER_URL=https://px-rho.vercel.app

# Endpoints spécifiques
VITE_API_CTR_CENTER_URL_ENDPOINT=/api/events/latest
VITE_API_CTR_CENTER_URL_LOCATION_ENDPOINT=/api/zone
VITE_API_CTR_CENTER_URL_CHAT_ENDPOINT=/chat
```

#### Backend (`.env`)

```env
# Port du serveur
PORT=3000

# Cache TTL pour les événements (ms)
EVENTS_CACHE_TTL_MS=5000

# URLs API externes
VITE_API_CTR_CENTER_URL=https://px-rho.vercel.app
VITE_API_CTR_CENTER_URL_ENDPOINT=/api/events/latest
```

### Configuration Tailwind

Le fichier `tailwind.config.js` contient :
- Couleurs personnalisées (neon-green, neon-cyan)
- Animations personnalisées
- Classes utilitaires

### Configuration Vite

Le fichier `vite.config.js` configure :
- Plugin React
- Alias de chemins
- Optimisations de build

---

## Développement

### Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de dev (port 5173)

# Build
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Backend
npm run server       # Démarrer le serveur Express (port 3000)
```

### Standards de code

- **ESLint** pour le linting
- **Prettier** (recommandé) pour le formatage
- **Conventions React** : PascalCase pour les composants
- **Conventions CSS** : BEM-like avec Tailwind

### Workflow de développement

1. Créer une branche depuis `main`
2. Développer la fonctionnalité
3. Tester localement
4. Créer une Pull Request
5. Code review et merge

---

## Déploiement

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

### Déploiement sur Vercel

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Déploiement sur Netlify

1. Build command : `npm run build`
2. Publish directory : `dist`
3. Configurer les variables d'environnement

---

## Communes disponibles

La carte affiche les **7 principales communes** de Port-au-Prince :

| Commune | Population | Couleur |
|---------|-----------|---------|
| **Delmas** | 395,260 | 🔵 Bleu |
| **Pétion-Ville** | 283,052 | 🟢 Vert |
| **Croix-des-Bouquets** | 229,127 | 🟡 Jaune |
| **Carrefour** | 465,019 | 🟠 Orange |
| **Port-au-Prince** | 987,310 | 🔴 Rouge |
| **Cité Soleil** | 241,093 | 🟣 Violet |
| **Tabarre** | 118,477 | ⚪ Gris |

---

## Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## Auteurs

- **Équipe Patrol-X** - Développement initial
    **Rockson NOEL**

---

<div align="center">

**Developer dans le cadre d'un Hackathon (AyitiAi) avec l'équipe Patrol-X**

[Documentation](#-documentation) • [Issues](https://github.com/votre-username/patrol-x/issues) • [Discussions](https://github.com/votre-username/patrol-x/discussions)

</div>
