import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FirePuzzle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          🔥 Correct! 🔥
        </h1>
        
        <div className="mb-8 text-muted-foreground">
          <p className="mb-4">You&apos;ve solved the first riddle!</p>
          <p className="mb-4">But don&apos;t get too comfortable... this is just the beginning.</p>
          <div className="bg-muted p-4 rounded-lg my-6">
            <p className="font-mono">
              &quot;The more you take, the more you leave behind. What am I?&quot;
            </p>
          </div>
          <p className="mt-6">Choose your next step wisely:</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="default">
              <Link href="/puzzle/footsteps">
                Footsteps
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/time">
                Time
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/memories">
                Memories
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/breath">
                Breath
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            The answer is right under your nose... or rather, your feet.
          </p>
        </div>
      </div>
    </div>
  );
}
