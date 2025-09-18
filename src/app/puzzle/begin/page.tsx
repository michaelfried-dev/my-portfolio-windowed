import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BeginPuzzle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          The First Clue
        </h1>
        
        <div className="mb-8 text-muted-foreground">
          <p className="mb-4">You&apos;ve taken the first step down the rabbit hole.</p>
          <p className="mb-4">To proceed, you&apos;ll need to solve this riddle:</p>
          <div className="bg-muted p-4 rounded-lg my-6">
            <p className="font-mono italic">
              I&apos;m not alive, but I can grow;<br />
              I don&apos;t have lungs, but I need air;<br />
              I don&apos;t have a mouth, but water kills me.<br />
              What am I?
            </p>
          </div>
          <p className="mt-6">Think you know the answer? Enter it below:</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link href="/puzzle/fire">
                Fire
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/puzzle/water">
                Water
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
            Hint: The answer is one of the buttons above.
          </p>
        </div>
      </div>
    </div>
  );
}
