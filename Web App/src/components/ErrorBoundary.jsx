export class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false, error: null }
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true, error }
    }
  
    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8 max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Une erreur est survenue
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                L'application a rencontré un problème inattendu. Veuillez rafraîchir la page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
        )
      }
  
      return this.props.children
    }
}