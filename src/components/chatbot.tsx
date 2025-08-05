'use client'
import { useState, useRef, useEffect } from 'react'
import { useWindowSize } from '@/hooks/useWindowSize'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, Maximize2, Minimize2 } from 'lucide-react'
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

interface QAPair {
  question: string
  answer: string
  image?: string
  usedLmStudio?: boolean
  lmStudioModel?: string
  source?: string
  model?: string
}

export function Chatbot() {
  const { width, height } = useWindowSize()
  const isSmallScreen = (width || 0) < 448 || (height || 0) < 700 // max-w-md is 448px, 700px is arbitrary height
  const [open, setOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [qa, setQa] = useState<QAPair[]>([])
  const [inputValue, setInputValue] = useState('')
  const [imageData, setImageData] = useState<string | null>(null)
  const [imageType, setImageType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const latestAnswerRef = useRef<HTMLDivElement>(null)
  const prevAnswer = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMounted = useRef(true)

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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageData(null)
      setImageType(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      setImageData(base64)
      setImageType(file.type)
    }
    reader.readAsDataURL(file)
  }

  // Handle key down events for form submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Add the user's question (and image if present) to the chat
    const question = inputValue.trim()
    const preview =
      imageData && imageType
        ? `data:${imageType};base64,${imageData}`
        : undefined
    setQa((prev) => [...prev, { question, answer: '', image: preview }])
    setInputValue('')
    setImageData(null)
    setImageType(null)
    setIsLoading(true)
    setError(null)

    try {
      // Call the API
      const payload: Record<string, any> = { question }
      if (imageData) payload.image = imageData
      if (imageType) payload.imageType = imageType
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      const answer = data.answer || 'Sorry, I could not generate an answer.'
      const usedLmStudio =
        data.usedLmStudio || data.source === 'lmstudio' || false
      const lmStudioModel = usedLmStudio
        ? data.lmStudioModel || data.model || 'LM Studio'
        : undefined
      const source = usedLmStudio ? 'lmstudio' : data.source || 'huggingface'
      const model = usedLmStudio
        ? lmStudioModel || 'LM Studio'
        : data.model || 'unknown'

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Update the last QA pair with the answer and API source info
        setQa((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (lastIndex >= 0) {
            const last = updated[lastIndex]
            updated[lastIndex] = {
              question,
              answer,
              source,
              model,
              usedLmStudio,
              lmStudioModel,
              image: last.image,
            }
          }
          return updated
        })
      }
    } catch (error) {
      console.error('Error:', error)
      if (isMounted.current) {
        setQa((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (lastIndex >= 0) {
            const last = updated[lastIndex]
            updated[lastIndex] = {
              question,
              answer:
                'Sorry, there was an error processing your request. Please try again later.',
              source: 'error',
              model: 'error',
              usedLmStudio: false,
              image: last.image,
            }
          }
          return updated
        })
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }

    // Cleanup function
    return () => {
      isMounted.current = false
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
              isSmallScreen || isFullscreen
                ? 'inset-0 h-full w-full'
                : 'right-4 bottom-4 w-full max-w-md',
            )}
          >
            <Card
              data-testid="chatbot-card"
              className={cn(
                (isSmallScreen || isFullscreen) && 'flex h-full flex-col',
              )}
            >
              <div className="border-border flex items-center gap-2 border-b p-4">
                <MessageSquare className="text-primary h-5 w-5" />
                <div className="flex-1">
                  <span className="font-semibold">AI Assistant</span>
                  <div className="text-muted-foreground text-xs">
                    Ask about my experience • Powered by AI
                  </div>
                </div>
                {!isSmallScreen && (
                  <button
                    className="rounded-base text-muted-foreground hover:bg-muted ml-auto p-1"
                    aria-label={
                      isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                    }
                    onClick={() => setIsFullscreen((prev) => !prev)}
                    type="button"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button
                  className={cn(
                    'rounded-base text-muted-foreground hover:bg-muted p-1',
                    isSmallScreen && 'ml-auto',
                  )}
                  aria-label="Close Chatbot"
                  onClick={() => {
                    setOpen(false)
                    setIsFullscreen(false)
                  }}
                  type="button"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
              <div
                ref={chatAreaRef}
                data-testid="chatbot-chat-area"
                className={cn(
                  'space-y-2 overflow-y-auto p-4',
                  isSmallScreen || isFullscreen ? 'flex-grow' : 'h-64',
                )}
              >
                {qa.map((item, i: number) => (
                  <div key={i}>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg px-3 py-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt="Uploaded"
                            className="mb-2 max-w-full rounded"
                          />
                        )}
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
                            {item.usedLmStudio ? (
                              <div className="text-muted-foreground mt-2 text-xs italic">
                                Powered by local and private AI (
                                {item.lmStudioModel || 'LM Studio'})
                              </div>
                            ) : (
                              <div className="text-muted-foreground mt-2 text-xs italic">
                                Powered by Hugging Face (Gemma-7B)
                              </div>
                            )}
                          </div>
                        ) : isLoading && i === qa.length - 1 ? (
                          <span className="text-muted animate-pulse">
                            Connecting to AI...
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
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Upload image"
                    disabled={isLoading}
                  />
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                      placeholder="e.g. Where did Michael Fried work in 2023?"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                    >
                      {isLoading ? '...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
