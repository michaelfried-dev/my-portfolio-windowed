import React from 'react'

// Simple mock for react-markdown that just renders children as plain text or elements
const ReactMarkdown = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)

export default ReactMarkdown
