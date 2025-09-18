import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DarknessPuzzle() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-black text-white">
      <div className="max-w-2xl mx-auto p-8 rounded-lg border border-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-yellow-300">
          🌑 Darkness Falls 🌑
        </h1>
        
        <div className="mb-8 text-gray-300">
          <p className="mb-4">You&apos;ve found the darkness...</p>
          <p className="mb-4">But is this the end? Or just another beginning?</p>
          <div className="bg-gray-900 p-4 rounded-lg my-6">
            <p className="font-mono text-yellow-200">
              &quot;I can be cracked, made, told, and played. What am I?&quot;
            </p>
          </div>
          <p className="mt-6 text-gray-400">The answer will light your way:</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="default" className="bg-gray-900 text-white hover:bg-gray-800">
              <Link href="/puzzle/joke">
                A Joke
              </Link>
            </Button>
            <Button asChild variant="default" className="bg-gray-900 text-white hover:bg-gray-800">
              <Link href="/puzzle/code">
                A Code
              </Link>
            </Button>
            <Button asChild variant="default" className="bg-gray-900 text-white hover:bg-gray-800">
              <Link href="/puzzle/rickroll">
                A Smile
              </Link>
            </Button>
            <Button asChild variant="default" className="bg-gray-900 text-white hover:bg-gray-800">
              <Link href="/puzzle/begin">
                Start Over
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            The answer is something that brings light to darkness.
          </p>
        </div>
      </div>
    </div>
  );
}
