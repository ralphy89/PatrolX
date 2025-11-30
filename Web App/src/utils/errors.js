export class ApiError extends Error {
    constructor(message, status, data) {
      super(message)
      this.status = status
      this.data = data
      this.name = 'ApiError'
    }
  }
  
  export const handleApiError = (error) => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 404:
          return 'Zone non trouvée'
        case 500:
          return 'Erreur serveur. Veuillez réessayer.'
        case 503:
          return 'Service temporairement indisponible'
        default:
          return 'Une erreur est survenue'
      }
    }
    if (!navigator.onLine) {
      return 'Vous êtes hors ligne. Vérifiez votre connexion.'
    }
    return 'Erreur de connexion. Veuillez réessayer.'
  }