'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

import React from 'react'

const PHONE = '856-905-0670'

// Converts phone numbers in a string to a markdown link
function linkifyPhone(text: string): string {
  // Escape characters with special meaning in regex
  const escapedPhone = PHONE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const phoneRegex = new RegExp(escapedPhone, 'g')
  const rawPhoneNumber = PHONE.replace(/\D/g, '')
  return text.replace(phoneRegex, `[${PHONE}](tel:${rawPhoneNumber})`)
}

// Renders markdown and ensures links open in a new tab
function SafeMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      urlTransform={(url) => url}
      components={{
        a: ({ node, ...props }) => {
          const isHttp = props.href?.startsWith('http')
          return (
            <a
              {...props}
              target={isHttp ? '_blank' : undefined}
              rel={isHttp ? 'noopener noreferrer' : undefined}
              className="text-blue-600 underline dark:text-blue-400"
            />
          )
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [qa, setQa] = useState<Array<{ question: string; answer: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const latestAnswerRef = useRef<HTMLDivElement>(null)
  const prevAnswer = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to the new answer (assistant message) when it arrives
  useEffect(() => {
    const last = qa[qa.length - 1]
    if (
      last &&
      last.answer &&
      last.answer !== prevAnswer.current &&
      latestAnswerRef.current
    ) {
      // Scroll to the top of the new answer
      latestAnswerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
    // Only focus input after new message or answer
    if (inputRef.current) {
      inputRef.current.focus()
    }
    prevAnswer.current = last ? last.answer : null
  }, [qa, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setIsLoading(true)
    setError(null)
    const question = input.trim()
    setInput('')
    // Focus the input after submit
    if (inputRef.current) inputRef.current.focus()
    // Show the user's prompt immediately with a placeholder answer
    setQa((prev) => [...prev, { question, answer: '' }])
    // Scroll to bottom after submitting
    setTimeout(() => {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 0)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to get answer')
        setIsLoading(false)
        return
      }
      const data = await response.json()
      // Ensure answer is always a string
      let safeAnswer: string
      if (typeof data.answer === 'string') {
        safeAnswer = data.answer
      } else if (data.answer != null) {
        safeAnswer = `[Invalid answer type: ${typeof data.answer}]`
        console.error(
          'Chatbot backend returned non-string answer:',
          data.answer,
        )
      } else {
        safeAnswer = '[No answer received]'
      }
      // Update the last QA pair with the answer
      setQa((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { question, answer: safeAnswer }
        return updated
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Always focus input on mount and when widget is opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <>
      {/* Floating Button to open chatbot */}
      {!open && (
        <Button
          variant="neutral"
          size="icon"
          className="fixed right-6 bottom-6 z-50"
          aria-label="Open Chatbot"
          onClick={() => setOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      {/* Chatbot Widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="chatbot-widget"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 16,
              mass: 1.7,
            }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed right-4 bottom-4 z-50 w-full max-w-md shadow-lg"
          >
            <Card>
              <div className="border-border flex items-center gap-2 border-b p-4">
                <MessageSquare className="text-primary h-5 w-5" />
                <span className="flex-1 font-semibold">
                  Ask about my experience
                </span>
                <Button
                  variant="neutral"
                  size="icon"
                  className="ml-auto"
                  aria-label="Close Chatbot"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <span className="text-lg">×</span>
                </Button>
              </div>
              <div
                ref={chatAreaRef}
                className="h-64 space-y-2 overflow-y-auto p-4"
              >
                {qa.map((item, i: number) => (
                  <div key={i}>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg px-3 py-2">
                        {item.question}
                      </div>
                    </div>
                    <div className="mt-1 flex justify-start">
                      <div
                        className="bg-muted text-muted-foreground max-w-[80%] rounded-lg px-3 py-2"
                        ref={i === qa.length - 1 ? latestAnswerRef : undefined}
                      >
                        {item.answer ? (
                          <div className="prose dark:prose-invert max-w-none text-sm">
                            {typeof item.answer === 'string' ? (
                              <SafeMarkdown>
                                {linkifyPhone(item.answer)}
                              </SafeMarkdown>
                            ) : (
                              <span style={{ color: 'red' }}>
                                [Chatbot error: answer is not a string]
                              </span>
                            )}
                          </div>
                        ) : isLoading && i === qa.length - 1 ? (
                          <span className="text-muted animate-pulse">
                            Thinking...
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {error && (
                  <div className="mt-2 flex justify-center">
                    <div className="bg-error text-error-foreground rounded-lg px-3 py-2">
                      {error}
                    </div>
                  </div>
                )}
                <div ref={endOfMessagesRef} />
              </div>
              <form
                onSubmit={handleSubmit}
                className="border-border border-t p-4"
              >
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                    placeholder="e.g. Where did Michael Fried work in 2023?"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    {isLoading ? '...' : 'Send'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
