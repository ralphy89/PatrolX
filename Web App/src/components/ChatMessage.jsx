import React, { memo, useState, useEffect } from 'react'
import { parseMarkdown } from '../utils/markdown.jsx'
import { useTypingEffect } from '../hooks/useTypingEffect'

const ChatMessage = memo(({ message, isUser = false, isAIResponse = false, enableTyping = true }) => {
  // Utiliser l'effet de typing uniquement pour les vraies réponses de l'IA (isAIResponse === true)
  const shouldType = isAIResponse && enableTyping
  const displayedText = useTypingEffect(message, 20, shouldType)
  const [isTypingComplete, setIsTypingComplete] = useState(!shouldType)

  // Détecter quand le typing est terminé
  useEffect(() => {
    if (shouldType && displayedText === message) {
      setIsTypingComplete(true)
    }
  }, [displayedText, message, shouldType])

  // Afficher le curseur de typing pendant que le message s'affiche
  const textToDisplay = shouldType ? displayedText : message

  return (
    <div className={`mb-3 md:mb-4 ${isUser ? 'text-right animate-slideInRight' : 'text-left animate-slideInLeft'}`}>
      <div
        className={`inline-block max-w-[90%] md:max-w-[85%] px-4 md:px-5 py-3 md:py-3.5 rounded-2xl transition-all duration-300 font-mono ${isUser
          ? 'bg-neon-green/10 border-2 border-neon-green text-neon-green shadow-neon-green'
          : 'glass border-2 border-neon-green/50 text-neon-green hover:border-neon-green/70 shadow-neon-green/50'
          }`}
      >
        <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">
          {parseMarkdown(textToDisplay)}
          {/* Curseur clignotant pendant le typing */}
          {shouldType && !isTypingComplete && (
            <span className="inline-block w-0.5 h-4 bg-neon-green ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'

export default ChatMessage