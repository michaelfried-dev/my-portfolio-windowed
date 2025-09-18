import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FootstepsPuzzle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          👣 Well Done! 👣
        </h1>
        
        <div className="mb-8 text-muted-foreground">
          <p className="mb-4">You&apos;re on the right path!</p>
          <p className="mb-4">Here&apos;s your next challenge:</p>
          <div className="bg-muted p-4 rounded-lg my-6">
            <p className="font-mono">
              I&apos;m light as a feather, yet the strongest person can&apos;t hold me for more than a few minutes. What am I?
            </p>
          </div>
          <p className="mt-6">Think carefully before choosing:</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="default">
              <Link href="/puzzle/breath">
                Breath
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/air">
                Air
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/thoughts">
                Thoughts
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/secret">
                A Secret
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            The answer is something you do every moment of your life.
          </p>
        </div>
      </div>
    </div>
  );
}
