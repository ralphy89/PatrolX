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
          ? 'bg-emerald-100 dark:bg-neon-green/10 border-2 border-emerald-500 dark:border-neon-green text-black dark:text-neon-green shadow-md dark:shadow-neon-green'
          : 'bg-white dark:bg-gray-800/80 border-2 border-emerald-300 dark:border-neon-green/50 text-black dark:text-neon-green hover:border-emerald-400 dark:hover:border-neon-green/70 shadow-sm dark:shadow-neon-green/50'
          }`}
      >
        <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
          {parseMarkdown(textToDisplay)}
          {/* Curseur clignotant pendant le typing */}
          {shouldType && !isTypingComplete && (
            <span className="inline-block w-0.5 h-4 bg-emerald-600 dark:bg-neon-green ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'

export default ChatMessage