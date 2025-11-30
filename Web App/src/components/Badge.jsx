import React from 'react'

export const Badge = ({ variant = 'default', children, className = '', onClick }) => {
  const variants = {
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    pertinent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    ignored: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    active: 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700'
  }

  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag 
      onClick={onClick}
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold transition-colors ${variants[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}