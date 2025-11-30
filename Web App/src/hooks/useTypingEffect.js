import { useState, useEffect } from 'react'

/**
 * Hook pour créer un effet de typing (texte qui s'affiche progressivement)
 * @param {string} text - Le texte complet à afficher
 * @param {number} speed - Vitesse de typing en millisecondes (par défaut 30ms)
 * @param {boolean} enabled - Active ou désactive l'effet (par défaut true)
 * @returns {string} Le texte affiché progressivement
 */
export const useTypingEffect = (text, speed = 30, enabled = true) => {
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    // Convertir text en string si ce n'est pas une string
    const textString = typeof text === 'string' ? text : String(text || '')

    useEffect(() => {
        // Si l'effet est désactivé, afficher tout le texte immédiatement
        if (!enabled) {
            setDisplayedText(textString)
            return
        }

        // Réinitialiser si le texte change
        if (textString !== displayedText && currentIndex === 0) {
            setDisplayedText('')
        }

        // Si on a affiché tout le texte, arrêter
        if (currentIndex >= textString.length) {
            return
        }

        // Timer pour ajouter un caractère
        const timer = setTimeout(() => {
            setDisplayedText(textString.substring(0, currentIndex + 1))
            setCurrentIndex(prev => prev + 1)
        }, speed)

        return () => clearTimeout(timer)
    }, [textString, currentIndex, speed, enabled])

    // Réinitialiser quand le texte change
    useEffect(() => {
        setCurrentIndex(0)
        setDisplayedText('')
    }, [textString])

    return displayedText
}

export default useTypingEffect
