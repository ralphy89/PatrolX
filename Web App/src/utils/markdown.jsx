import React from 'react'

export const parseMarkdown = (text) => {
  let keyCounter = 0
  const rules = [
    { 
      pattern: /\*\*(.+?)\*\*/g, 
      Component: ({ match, i }) => (
        <strong key={i} className="font-semibold">
          {match[1]}
        </strong>
      )
    },
    { 
      pattern: /\*(.+?)\*/g, 
      Component: ({ match, i }) => (
        <em key={i} className="italic">
          {match[1]}
        </em>
      )
    },
    { 
      pattern: /`(.+?)`/g, 
      Component: ({ match, i }) => (
        <code 
          key={i} 
          className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs"
        >
          {match[1]}
        </code>
      )
    },
  ]

  let parts = [{ type: 'text', content: text }]

  rules.forEach(({ pattern, Component }) => {
    parts = parts.flatMap(part => {
      if (part.type !== 'text') return part

      const newParts = []
      let lastIndex = 0
      const matches = [...part.content.matchAll(pattern)]

      matches.forEach((match, i) => {
        if (match.index > lastIndex) {
          newParts.push({ 
            type: 'text', 
            content: part.content.slice(lastIndex, match.index) 
          })
        }
        const globalKey = keyCounter++
        newParts.push({ 
          type: 'component', 
          content: <Component match={match} i={globalKey} key={globalKey} /> 
        })
        lastIndex = match.index + match[0].length
      })

      if (lastIndex < part.content.length) {
        newParts.push({ 
          type: 'text', 
          content: part.content.slice(lastIndex) 
        })
      }

      return newParts.length ? newParts : [part]
    })
  })

  return parts.map((part, i) => 
    part.type === 'component' ? part.content : <span key={i}>{part.content}</span>
  )
}