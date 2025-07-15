'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function Chatbot() {
  const [qa, setQa] = useState<Array<{question: string, answer: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const latestAnswerRef = useRef<HTMLDivElement>(null);
  const prevAnswer = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to the new answer (assistant message) when it arrives
  useEffect(() => {
    const last = qa[qa.length - 1];
    if (last && last.answer && last.answer !== prevAnswer.current && latestAnswerRef.current) {
      // Scroll to the top of the new answer
      latestAnswerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Only focus input after new message or answer
    if (inputRef.current) {
      inputRef.current.focus();
    }
    prevAnswer.current = last ? last.answer : null;
  }, [qa, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    const question = input.trim();
    setInput('');
    // Focus the input after submit
    if (inputRef.current) inputRef.current.focus();
    // Show the user's prompt immediately with a placeholder answer
    setQa(prev => [...prev, { question, answer: '' }]);
    // Scroll to bottom after submitting
    setTimeout(() => {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to get answer');
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      // Update the last QA pair with the answer
      setQa(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { question, answer: data.answer };
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Always focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);



  return (
    <Card className="fixed bottom-4 right-4 w-96 border-4 border-border shadow-[8px_8px_0_0_#000]">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h3 className="font-bold">Ask Me Anything</h3>
        <MessageSquare className="h-5 w-5" />
      </div>
      
      <div ref={chatAreaRef} className="h-64 overflow-y-auto p-4 space-y-2">

        {qa.map((item, i: number) => (
          <div key={i}>
            <div className="flex justify-end">
              <div
                className="rounded-lg px-3 py-2 max-w-[80%] bg-primary text-primary-foreground"
              >
                {item.question}
              </div>
            </div>
            <div className="flex justify-start mt-1">
              <div
                className="rounded-lg px-3 py-2 max-w-[80%] bg-muted text-muted-foreground"
                ref={i === qa.length - 1 ? latestAnswerRef : undefined}
              >
                {item.answer || (isLoading && i === qa.length - 1 ? <span className="animate-pulse text-muted">Thinking...</span> : null)}
              </div>
            </div>
          </div>
        ))}
        {error && (
          <div className="flex justify-center mt-2">
            <div className="rounded-lg px-3 py-2 bg-error text-error-foreground">
              {error}
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-border rounded-lg px-3 py-2"
            placeholder="e.g. Where did Michael Fried work in 2023?"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '...' : 'Send'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
