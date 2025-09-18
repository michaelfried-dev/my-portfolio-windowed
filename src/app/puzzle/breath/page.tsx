import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BreathPuzzle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          🌬️ Excellent! 🌬️
        </h1>
        
        <div className="mb-8 text-muted-foreground">
          <p className="mb-4">You&apos;re really good at this!</p>
          <p className="mb-4">Time for the final riddle:</p>
          <div className="bg-muted p-4 rounded-lg my-6">
            <p className="font-mono">
              I&apos;m always in front of you but can&apos;t be seen. What am I?
            </p>
          </div>
          <p className="mt-6">Choose wisely, this is your final test:</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="default">
              <Link href="/puzzle/future">
                The Future
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/horizon">
                The Horizon
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/rickroll">
                A Mirror
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/air">
                Air
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            The answer is something that&apos;s always ahead of you, yet you can never reach it.
          </p>
        </div>
      </div>
    </div>
  );
}
