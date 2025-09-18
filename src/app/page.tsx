import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          Welcome to the Rabbit Hole
        </h1>
        
        <div className="mb-8 text-muted-foreground">
          <p className="mb-4">You&apos;ve stumbled upon something... unusual.</p>
          <p className="mb-4">This isn&apos;t what you were expecting to find, was it?</p>
          <p>Curiosity is a powerful thing. It can lead to amazing discoveries...</p>
          <p className="mt-2">Or down a very deep rabbit hole.</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            What would you like to do?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link href="/puzzle/begin">
                Begin the Journey
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/secret">
                I know the secret
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Hint: Not everything is as it seems. Look closely.
        </p>
      </div>
    </div>
  );
}
