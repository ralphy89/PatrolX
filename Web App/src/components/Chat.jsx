import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../context/store'
import { askQuestion } from '../api/api'
import ChatMessage from './ChatMessage'
import { handleApiError } from '../utils/errors'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { MapPin, AlertTriangle } from 'lucide-react'

// Fonction utilitaire pour décoder les caractères encodés en URL
const decodeHtmlEntities = (text) => {
  if (!text) return '';
  try {
    return decodeURIComponent(text);
  } catch (e) {
    console.error('Erreur lors du décodage du texte:', e);
    return text;
  }
};

const Chat = ({ onClose, isMobile }) => {
  const {
    selectedZone,
    activeZone,
    zoneData,
    messages,
    addMessage,
    setMessages,
    chatLoading,
    setChatLoading,
    isLoading, // Pour afficher le loading lors du chargement de zone
  } = useStore()

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const isOnline = useOnlineStatus()
  const lastDisplayedZoneRef = useRef(null)
  const welcomeMessageShownRef = useRef(false) // Pour éviter le double message de bienvenue

  // Message de bienvenue initial (une seule fois)
  useEffect(() => {
    if (messages.length === 0 && !zoneData && !welcomeMessageShownRef.current) {
      welcomeMessageShownRef.current = true
      setMessages([
        {
          text: 'Bonjour ! Je suis votre assistant Patrol-X. Vous pouvez me poser des questions sur les zones de Port-au-Prince, ou discuter avec moi. Pour voir l\'état des lieux d\'une zone spécifique, sélectionnez-la sur la carte.',
          isUser: false,
          timestamp: Date.now(),
          isAIResponse: false, // Message système, pas de typing
        },
      ])
    }
  }, []) // Dépendances vides = s'exécute une seule fois au montage

  // Afficher l'état des lieux quand une zone est sélectionnée
  useEffect(() => {
    const hasSelectedZone = selectedZone && selectedZone.length > 0
    if (!zoneData || !zoneData.summary || !hasSelectedZone) {
      return
    }

    // Ne pas afficher l'état général dans le chat
    const isGeneral = zoneData.zone && zoneData.zone.includes('Général')
    if (isGeneral) {
      return
    }

    // Utiliser la zone du zoneData si disponible, sinon la zone active/sélectionnée
    const zoneToShow = activeZone || (selectedZone && selectedZone.length > 0 ? selectedZone[selectedZone.length - 1] : null)
    const actualZone = zoneData.zone || zoneToShow

    // Créer un identifiant unique pour cette zone + summary
    const zoneKey = `${actualZone}:${zoneData.summary.substring(0, 50)}`

    // Vérifier si on a déjà affiché cette zone exacte
    if (lastDisplayedZoneRef.current === zoneKey) {
      console.log('🚫 Message ignoré - déjà affiché:', actualZone)
      return
    }

    const messageText = `**État des lieux — ${actualZone}**\n\n${decodeHtmlEntities(zoneData.summary)}`
    // Vérifier si ce message exact n'existe pas déjà
    const messageExists = messages.some(
      msg => msg.text === messageText && !msg.isUser
    )

    if (!messageExists) {
      console.log('✅ Ajout du message pour:', actualZone)
      lastDisplayedZoneRef.current = zoneKey
      addMessage({
        text: messageText,
        isUser: false,
        timestamp: Date.now(),
        isAIResponse: false, // Message automatique de zone, pas de typing
      })
    } else {
      console.log('🚫 Message ignoré - existe déjà:', actualZone)
    }
  }, [
    zoneData?.zone,
    zoneData?.summary,
    activeZone,
    selectedZone?.length, // Utiliser .length au lieu de l'array entier
    addMessage,
    messages.length // Utiliser .length au lieu de l'array entier
  ])

  // Gérer la désélection de toutes les zones
  useEffect(() => {
    if (!activeZone && selectedZone && selectedZone.length === 0) {
      lastDisplayedZoneRef.current = null // Reset le ref
    }
  }, [activeZone, selectedZone?.length, addMessage, messages.length])

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Gestion de l'envoi de message
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || chatLoading) return;

    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    const question = inputValue.trim();
    setInputValue('');
    setChatLoading(true);

    // Validation avant d'envoyer
    if (!question || question.length === 0) {
      setChatLoading(false);
      return;
    }

    try {
      console.log('Chat.jsx - Envoi de la question:', question);
      const response = await askQuestion(question);
      console.log('Réponse du serveur:', response); // Pour le débogage

      // Extraire le texte de la réponse - gérer plusieurs formats possibles
      let responseText = '';

      if (typeof response === 'string') {
        // Si la réponse est directement une string
        responseText = response;
      } else if (response?.data?.response) {
        // Format standard: { data: { response: "texte" } }
        responseText = response.data.response;
      } else if (response?.response) {
        // Format alternatif: { response: "texte" }
        responseText = response.response;
      } else if (response?.data && typeof response.data === 'string') {
        // Format: { data: "texte" }
        responseText = response.data;
      } else {
        // Fallback: essayer de convertir en JSON puis extraire
        console.warn('Format de réponse inattendu:', response);
        responseText = 'Réponse reçue mais format inattendu';
      }

      // S'assurer que c'est bien une string
      if (typeof responseText !== 'string') {
        console.error('responseText n\'est pas une string:', responseText);
        responseText = JSON.stringify(responseText);
      }

      const aiMessage = {
        text: responseText,
        isUser: false,
        timestamp: Date.now(),
        isAIResponse: true, // Vraie réponse de l'IA, activer le typing
      };

      addMessage(aiMessage);
    } catch (error) {
            addMessage({
              text: `${handleApiError(error)}`,
              isUser: false,
              timestamp: Date.now(),
              isAIResponse: false, // Message d'erreur, pas de typing
            });
    } finally {
      setChatLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-emerald-200 dark:border-neon-green/30 flex items-center justify-between shrink-0 bg-white dark:bg-black relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 dark:bg-neon-green rounded-full animate-pulse" title="En ligne" />
            <h2 className="text-base md:text-lg font-mono font-bold text-emerald-700 dark:text-neon-green uppercase tracking-wider dark:[text-shadow:0_0_10px_rgba(0,255,0,0.5)]">
              CHAT IA
            </h2>
          </div>
          {(selectedZone && selectedZone.length > 0) ? (
            <p className="text-xs md:text-sm text-emerald-600 dark:text-neon-green/60 mt-0.5 truncate font-mono uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {activeZone
                ? `Vue d'ensemble — ${activeZone}`
                : selectedZone.length === 1
                  ? `Vue d'ensemble — ${selectedZone[0]}`
                  : `${selectedZone.length} zones sélectionnées`
              }
            </p>
          ) : (
            <p className="text-xs md:text-sm text-emerald-600 dark:text-neon-green/60 mt-0.5 truncate font-mono uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Vue d'ensemble — Port-au-Prince
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="relative z-10 ml-3 p-2 text-emerald-600 dark:text-neon-green/70 hover:text-emerald-700 dark:hover:text-neon-green hover:bg-emerald-50 dark:hover:bg-neon-green/10 border border-transparent hover:border-emerald-300 dark:hover:border-neon-green/30 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50"
            aria-label="Fermer le chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 bg-white dark:bg-black">
        {messages.map((msg, index) => (
          <ChatMessage
            key={`${msg.timestamp}-${index}`}
            message={msg.text}
            isUser={msg.isUser}
            isAIResponse={msg.isAIResponse || false}
          />
        ))}

        {/* Indicateur de chargement pour les questions du chat */}
        {chatLoading && (
          <div className="flex items-start gap-3 mb-4 animate-fadeIn">
            <div className="inline-block px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-gray-700/80 border border-emerald-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-gray-400 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs italic">Réflexion en cours</span>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de chargement pour le chargement des données de zone (seulement si une zone est sélectionnée) */}
        {isLoading && activeZone && selectedZone && selectedZone.length > 0 && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-gray-400 text-sm py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 dark:border-blue-500 border-t-transparent" />
            <span className="italic">Chargement des données de la zone...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-t border-emerald-200 dark:border-neon-green/30 shrink-0 bg-white dark:bg-black">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              color="black"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isOnline ? "Tapez votre question ou message..." : "Hors ligne..."}
              disabled={chatLoading || !isOnline}
              className="flex-1 px-4 py-3 text-sm md:text-base border-2 border-emerald-200 dark:border-neon-green/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 focus:border-emerald-500 dark:focus:border-neon-green disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-black text-black dark:text-neon-green placeholder-gray-600 dark:placeholder-neon-green/40 font-mono"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || chatLoading || !isOnline}
              className="group relative px-5 py-3 text-sm md:text-base bg-emerald-100 dark:bg-neon-green/10 border-2 border-emerald-500 dark:border-neon-green hover:bg-emerald-200 dark:hover:bg-neon-green/20 text-emerald-700 dark:text-neon-green rounded-lg transition-all duration-300 hover:shadow-md dark:hover:shadow-neon-green active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-neon-green/50 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:border-gray-400 dark:disabled:border-gray-700 disabled:text-gray-500 dark:disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none shrink-0 font-mono font-bold uppercase tracking-wider overflow-hidden"
              aria-label="Envoyer le message"
            >
              <span className="relative z-10 flex items-center gap-1">
                {isMobile ? (
                  <svg className="w-5 h-5" fill="none" stroke="green" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ) : (
                  'Envoyer'
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat