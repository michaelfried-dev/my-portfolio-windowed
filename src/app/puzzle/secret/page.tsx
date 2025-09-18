import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SecretPuzzle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          🤫 Shhh... It&apos;s a Secret
        </h1>
        
        <div className="mb-8 text-muted-foreground">
          <p className="mb-4">You found a secret path!</p>
          <p className="mb-4">But are you sure you want to take the easy way out?</p>
          <div className="bg-muted p-4 rounded-lg my-6">
            <p className="font-mono">
              &quot;The more you have of me, the less you see. What am I?&quot;
            </p>
          </div>
          <p className="mt-6">Choose your next step:</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="default">
              <Link href="/puzzle/darkness">
                Darkness
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/begin">
                Start Over
              </Link>
            </Button>
            <Button asChild>
              <Link href="/puzzle/rickroll">
                Skip to the End
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            The answer is right in front of you when you close your eyes.
          </p>
        </div>
      </div>
    </div>
  );
}
