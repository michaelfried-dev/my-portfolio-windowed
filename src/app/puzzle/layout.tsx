import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rabbit Hole Puzzle',
  description: 'A mysterious journey through a series of puzzles...',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function PuzzleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
