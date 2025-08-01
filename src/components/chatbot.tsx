'use client'
import { useState, useRef, useEffect } from 'react'
import { useWindowSize } from '@/hooks/useWindowSize'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

import React from 'react'
import { CONTACT_INFO } from '@/lib/constants'

// Converts phone numbers, URLs, and email addresses in a string into markdown links
function linkifyText(text: string): string {
  let result = text

  // 1. Phone number linkification (specific configured phone)
  // Escape any regex meta characters that might appear in the phone string
  // so that it can be safely used in a RegExp constructor.
  const escapedPhone = CONTACT_INFO.phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const phoneRegex = new RegExp(escapedPhone, 'g')
  const rawPhoneNumber = CONTACT_INFO.phone.replace(/\D/g, '')
  result = result.replace(
    phoneRegex,
    `[${CONTACT_INFO.phone}](tel:${rawPhoneNumber})`,
  )

  // 2. URL linkification – match http/https URLs not already in markdown links
  //    This basic regex intentionally stops at whitespace or closing parenthesis.
  const urlRegex = /(?<!\]\()https?:\/\/[^\s)]+/g
  result = result.replace(urlRegex, (url) => `[${url}](${url})`)

  // 3. Email linkification – match simple email patterns not already in markdown links
  const emailRegex =
    /(?<!\]\()([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g
  result = result.replace(emailRegex, (email) => `[${email}](mailto:${email})`)

  return result
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
  const { width, height } = useWindowSize()
  const isSmallScreen = (width || 0) < 448 || (height || 0) < 700 // max-w-md is 448px, 700px is arbitrary height
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
        if (response.status === 402) {
          setError(
            errorData.error ||
              "I've hit my message limit for the month. Please try again later.",
          )
        } else {
          setError(errorData.error || 'Failed to get answer')
        }
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

      // Add a note if LM Studio was used
      if (data.usedLmStudio) {
        safeAnswer = `*Response generated using my local LM Studio API*\n\n${safeAnswer}`
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
          className="fixed right-6 bottom-6 z-50 flex h-auto items-center gap-2 px-4 py-2"
          aria-label="Open AI Assistant"
          onClick={() => setOpen(true)}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm font-medium">AI Assistant</span>
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
            className={cn(
              'fixed z-50 shadow-lg',
              isSmallScreen
                ? 'inset-0 h-full w-full'
                : 'right-4 bottom-4 w-full max-w-md',
            )}
          >
            <Card className={cn(isSmallScreen && 'flex h-full flex-col')}>
              <div className="border-border flex items-center gap-2 border-b p-4">
                <MessageSquare className="text-primary h-5 w-5" />
                <div className="flex-1">
                  <span className="font-semibold">AI Assistant</span>
                  <div className="text-muted-foreground text-xs">
                    Ask about my experience • Powered by AI
                  </div>
                </div>
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
                className={cn(
                  'space-y-2 overflow-y-auto p-4',
                  isSmallScreen ? 'flex-grow' : 'h-64',
                )}
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
                            <SafeMarkdown>
                              {linkifyText(item.answer)}
                            </SafeMarkdown>
                          </div>
                        ) : isLoading && i === qa.length - 1 ? (
                          <span className="text-muted animate-pulse">
                            Thinking... trying Hugging Face first, then my local
                            LM Studio API with DeepSeek if needed
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {error && (
                  <div className="mt-2 flex justify-center">
                    <div className="bg-error text-error-foreground prose dark:prose-invert max-w-none rounded-lg px-3 py-2 text-sm">
                      <SafeMarkdown>{linkifyText(error)}</SafeMarkdown>
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
