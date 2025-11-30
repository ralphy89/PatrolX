# Patrol-X

> **Transforming chaotic public messages into clear, structured AI-generated alerts for Haiti**

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.2-000000?logo=flask)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)

**Patrol-X** is an intelligent real-time information analysis system that transforms chaotic public messages from WhatsApp, Telegram, and social media into clear, structured AI-generated alerts to help Haitians understand what is happening, where, and how serious it is—instantly.

---

## Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Components](#-components)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

Patrol-X is a comprehensive system that:

- **Collects** content from multiple sources (WhatsApp, Telegram, Twitter, RSS)
- **Filters** relevance using Grok AI (xAI)
- **Analyzes** and extracts structured events
- **Summarizes** key points with actionable recommendations
- **Notifies** users about critical events automatically
- **Answers** questions through an AI chat assistant
- **Visualizes** events on an interactive map
- **Helps** users make informed and rapid decisions

### Key Features

- **AI-Powered Analysis**: Uses Grok AI for intelligent message processing and event extraction
- **Interactive Map**: Real-time visualization of events across Port-au-Prince communes
- **AI Chat Assistant**: Natural language queries about current events
- **Real-time Notifications**: Automatic alerts for critical and high-severity events
- **Secure Authentication**: JWT-based user authentication and session management
- **Responsive Web App**: Modern, mobile-first interface with dark/light themes
- **Multi-language Support**: Haitian Creole, French, and English

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Collection Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   WhatsApp   │  │  Telegram    │  │ Social Media │       │
│  │   Scraper    │  │   Scraper    │  │   Scraper    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Backend API    │
                    │   (Flask/Python)│
                    │                 │
                    │  ┌──────────┐  │
                    │  │ Grok AI  │  │
                    │  │ Analysis │  │
                    │  └──────────┘  │
                    │                 │
                    │  ┌──────────┐  │
                    │  │ MongoDB  │  │
                    │  │  Atlas   │  │
                    │  └──────────┘  │
                    └────────┬───────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
    │  Web App   │    │  Mobile App │   │  API Users  │
    │  (React)   │    │  (Future)   │   │  (External) │
    └────────────┘    └─────────────┘   └─────────────┘
```

### Data Flow

1. **Ingestion**: Raw messages received via `POST /messages` or collected by scrapers
2. **Preprocessing**: Filter, normalize, extract hints using Grok AI
3. **Analysis**: Generate structured events using Grok AI
4. **Storage**: Save events to MongoDB production database
5. **Notification**: Automatically create notifications for critical/high severity events
6. **Query**: Retrieve and summarize by location or query type
7. **Chat**: Answer questions using RAG (Retrieval-Augmented Generation) with Grok AI
8. **Visualization**: Display events on interactive map in web application

---

## Project Structure

```
PatrolX/
├── PatrolX/                    # Backend API (Flask/Python)
│   ├── api/                    # API application
│   │   ├── app.py             # Flask application entry point
│   │   ├── auth.py            # Authentication logic (JWT, bcrypt)
│   │   ├── services.py        # AI services (Grok AI integration)
│   │   ├── utils.py           # Utility functions
│   │   ├── db/                # Database models
│   │   │   └── models.py      # MongoDB models and queries
│   │   └── prompts/           # AI prompts
│   │       └── system/        # System prompts for Grok AI
│   ├── docs/                   # API documentation
│   ├── requirements.txt        # Python dependencies
│   ├── vercel.json            # Vercel deployment config
│   └── README.md              # Backend documentation
│
├── Web App/                    # Frontend (React/Vite)
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── context/           # State management (Zustand)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   └── api/               # API client
│   ├── backend/               # Express proxy server
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   └── README.md              # Frontend documentation
│
├── data_colector/             # Data collection scripts
│   ├── extract_channel_messages.py  # WhatsApp channel scraper
│   ├── send_messages_batch.py      # Batch message sender
│   └── readme.md                    # Data collector documentation
│
└── README.md                  # This file (root documentation)
```

---

## Components

### 1. Backend API (`PatrolX/`)

Flask-based REST API that handles:
- Message ingestion and processing
- AI-powered event extraction using Grok AI
- User authentication and authorization
- Event storage and retrieval
- Notification management
- AI chat assistant

**Tech Stack:**
- Python 3.8+
- Flask 3.1.2
- MongoDB Atlas
- Grok AI (xAI)
- JWT authentication

**See**: [PatrolX/README.md](./PatrolX/README.md) for detailed documentation

### 2. Web Application (`Web App/`)

Modern React-based web application featuring:
- Interactive map with Leaflet
- Real-time event visualization
- AI chat interface
- Notification system
- User authentication
- Responsive design

**Tech Stack:**
- React 18.2.0
- Vite 5.0.8
- TailwindCSS 3.3.6
- React Leaflet 4.2.1
- Zustand 4.4.7

**See**: [Web App/README.md](./Web%20App/README.md) for detailed documentation

### 3. Data Collector (`data_colector/`)

Python scripts for collecting messages from various sources:
- WhatsApp channel scraper (Selenium)
- Batch message sender to API
- Message format conversion

**Tech Stack:**
- Python 3.8+
- Selenium
- Firefox/Geckodriver

**See**: [data_colector/readme.md](./data_colector/readme.md) for detailed documentation

---

## Quick Start

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB Atlas** account
- **Grok AI API key** from [xAI Console](https://console.x.ai/)
- **Firefox** and **Geckodriver** (for data collector)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PatrolX
   ```

2. **Set up Backend API**
   ```bash
   cd PatrolX
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up Web Application**
   ```bash
   cd "Web App"
   npm install
   ```

4. **Configure environment variables** (see [Configuration](#-configuration))

5. **Run the services**
   ```bash
   # Terminal 1: Backend API
   cd PatrolX/api
   python app.py

   # Terminal 2: Web App
   cd "Web App"
   npm run dev
   ```

---

## Configuration

### Backend Environment Variables

Create a `.env` file in `PatrolX/` or set environment variables:

```bash
# Grok AI (xAI) Configuration
export GROK_TOKEN=your_grok_api_key_from_xai_console

# MongoDB Configuration
export DB_USERNAME=your_mongodb_username
export DB_PASSWORD=your_mongodb_password

# JWT Secret (for authentication)
export JWT_SECRET=your_secure_random_secret_key
```

**Generate JWT_SECRET:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Frontend Environment Variables

Create a `.env` file in `Web App/`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_CTR_CENTER_URL=https://px-rho.vercel.app
VITE_API_CTR_CENTER_URL_ENDPOINT=/api/events/latest
VITE_API_CTR_CENTER_URL_LOCATION_ENDPOINT=/api/zone
VITE_API_CTR_CENTER_URL_CHAT_ENDPOINT=/chat
```

### Database Configuration

- **Cluster**: `px-prod.amaelqi.mongodb.net`
- **Database**: `production`
- **Collections**: `events`, `processed_messages`, `users`, `sessions`, `notifications`

---

## 📚 API Documentation

### Quick Reference

#### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in and get JWT token
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout and invalidate session

#### Events
- `POST /messages` - Process and analyze messages
- `GET /events/latest` - Get latest events
- `GET /events/location/<location>` - Get events by location

#### Chat
- `POST /chat` - Chat with AI assistant

#### Notifications
- `GET /notifications` - Get user notifications
- `POST /notifications/<id>/read` - Mark notification as read
- `POST /notifications/read-all` - Mark all as read
- `DELETE /notifications/<id>` - Delete notification

**Full Documentation:**
- [API Documentation](./PatrolX/docs/API_DOCUMENTATION.md)
- [API Quick Reference](./PatrolX/docs/API_QUICK_REFERENCE.md)
- [Postman Collection](./PatrolX/docs/PatrolX_API.postman_collection.json)

---

## AI Models

**Grok AI (xAI)** - All AI operations powered by Grok:
- **`grok-4-1-fast-reasoning`**: Deep analysis and event extraction
- **`grok-4-fast-reasoning`**: Preprocessing, chat, and summarization
- **Embeddings API**: For semantic search and RAG (Retrieval-Augmented Generation)

**API Endpoint**: `https://api.x.ai/v1`

Get your API key from: [https://console.x.ai/](https://console.x.ai/)

---

## Supported Locations

### Hierarchical (include subdivisions)
- **Delmas** (includes Delmas 1-110, Delmas 19, Delmas 33, etc.)
- **Tabarre** (includes Tabarre 19, Tabarre 33, etc.)
- **Pétion-Ville** (includes Petionville, Petyonvil, PV)
- **Croix-des-Bouquets** (includes Kwadebouke, Bon Repos)
- **Pèlerin** (includes Pelerin)
- **Thomassin**
- **Canapé-Vert** (includes Kanapevè)
- **Laboule** (includes Laboul)

### Non-Hierarchical (treated separately)
- **Carrefour** ≠ Carrefour Drouillard ≠ Carrefour Feuilles
- **Martissant**
- **Kenscoff**
- **Okap** (Cap-Haïtien)
- **Jérémie**

---

## Deployment

### Backend Deployment (Vercel)

1. Set environment variables in Vercel dashboard
2. Deploy using `vercel.json` configuration
3. Ensure MongoDB Atlas IP whitelist includes Vercel IPs

### Frontend Deployment

1. Build the application:
   ```bash
   cd "Web App"
   npm run build
   ```

2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - Any static hosting service

### Environment Setup

Ensure all environment variables are configured in your deployment platform:
- `GROK_TOKEN`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

---

## Testing

### Using Postman

1. Import collection from `PatrolX/docs/PatrolX_API.postman_collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `token`: JWT token from sign-in

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

**Sign In:**
```bash
curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**Process Messages:**
```bash
curl -X POST http://localhost:5000/messages \
  -H "Content-Type: application/json" \
  -d @data/whatsapp_messages.json
```

---

## 🔒 Security

### Authentication
- **JWT Tokens**: 7-day expiration
- **Password Hashing**: bcrypt with salt
- **Session Management**: Active sessions tracked in database

### API Security
- **CORS**: Configured for production origins
- **Token Validation**: All protected endpoints require valid JWT token
- **Password Requirements**: Enforced in frontend

---

## Troubleshooting

### Common Issues

1. **Grok AI API Error**
   - Verify `GROK_TOKEN` is set correctly
   - Check API key permissions at [console.x.ai](https://console.x.ai/)
   - Verify API quota/limits

2. **MongoDB Connection Error**
   - Check `DB_USERNAME` and `DB_PASSWORD` environment variables
   - Verify MongoDB Atlas IP whitelist
   - Check network connectivity

3. **JWT Token Invalid**
   - Check `JWT_SECRET` is set
   - Verify token hasn't expired (7 days)
   - Ensure token is sent in `Authorization: Bearer <token>` header

4. **Frontend API Connection Error**
   - Verify `VITE_API_CTR_CENTER_URL` is correct
   - Check CORS configuration on backend
   - Verify backend is running

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

---


## Team

**Patrol-X Team** - Hackathon Ayiti-ai 2025

This project was developed by a team of three developers with the following division of roles:

---

- **Ralph Djino DUMERA**

  - **Primary Role:** AI Specialist / Full Stack Developer

  - **Contributions:**

    - Design and development of the **Backend API** (Flask/Python) for event processing and analysis.

    - Implementation of **Grok AI integration** for message preprocessing, event extraction, and chat functionality.

    - Development of **AI services pipeline** including sentiment analysis, event classification, and structured data extraction.

    - Design and implementation of **MongoDB database models** and query logic.

    - Management of backend infrastructure, authentication system (JWT), and API endpoints.

  - **Component:** PatrolX (Backend API)

  - **GitHub:** [ralphy89](https://github.com/ralphy89)

---

- **Rockson NOEL**

  - **Primary Role:** Frontend Engineer / Full Stack Developer

  - **Contributions:**

    - Design and development of the **Web Application** (React/Vite) with interactive map visualization.

    - Implementation of **React Leaflet** integration for real-time event mapping across Port-au-Prince communes.

    - Development of **AI Chat Interface** with typing effects and markdown support.

    - Design and implementation of **Notification System** UI with real-time updates.

    - Frontend state management with **Zustand**, authentication flow, and responsive design.

  - **Component:** Web App (Frontend)

  - **GitHub:** [noelRockson](https://github.com/noelRockson)

---

- **Stephane LAINÉ**

  - **Primary Role:** Data Engineer / Automation Specialist

  - **Contributions:**

    - Development of **WhatsApp Channel Scraper** using Selenium and Firefox automation.

    - Implementation of **message extraction pipeline** from WhatsApp Web channels.

    - Design and development of **batch message sender** for API integration.

    - Automation of data collection workflows and message format conversion.

  - **Component:** Data Collector

  - **GitHub:** [stephLaine](https://github.com/stephLaine)

---

## Acknowledgments

Built for the people of Haiti 🇭🇹

**Patrol-X** - Turning chaos into clarity

---

## 📖 Additional Documentation

- [Backend API Documentation](./PatrolX/README.md)
- [Frontend Web App Documentation](./Web%20App/README.md)
- [Data Collector Documentation](./data_colector/readme.md)
- [API Full Documentation](./PatrolX/docs/API_DOCUMENTATION.md)
- [API Quick Reference](./PatrolX/docs/API_QUICK_REFERENCE.md)

---

<div align="center">

**Made with ❤️ for Haiti**

[Documentation](#-table-of-contents) • [API Docs](./PatrolX/docs/API_DOCUMENTATION.md) • [Web App](./Web%20App/README.md)

</div>

