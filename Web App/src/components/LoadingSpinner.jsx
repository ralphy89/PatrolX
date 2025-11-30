import React from 'react'

export const LoadingSpinner = ({ size = 'md', message = 'Chargement...', variant = 'primary' }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    }

    const variants = {
        primary: 'border-blue-500/30 border-t-blue-500',
        secondary: 'border-purple-500/30 border-t-purple-500',
        success: 'border-green-500/30 border-t-green-500',
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 animate-fadeIn">
            {/* Spinner avec double cercle pour effet de profondeur */}
            <div className="relative">
                <div
                    className={`animate-spin rounded-full border-4 ${sizes[size]} ${variants[variant]}`}
                    style={{ animationDuration: '1s' }}
                />
                <div
                    className={`absolute top-0 left-0 animate-spin rounded-full border-4 border-transparent ${sizes[size]}`}
                    style={{
                        animationDuration: '1.5s',
                        animationDirection: 'reverse',
                        borderTopColor: 'currentColor',
                        opacity: 0.2
                    }}
                />
            </div>

            {message && (
                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {message}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
        </div>
    )
}