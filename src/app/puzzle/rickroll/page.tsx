"use client";

import { useState, useEffect, useRef } from 'react';

export default function RickRoll() {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore - This will be available after the script loads
    window.onYouTubeIframeAPIReady = () => {
      if (!playerRef.current) return;
      
      // @ts-ignore - YT is available after script loads
      playerInstance.current = new YT.Player(playerRef.current, {
        height: '360',
        width: '640',
        videoId: 'dQw4w9WgXcQ',
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: 'dQw4w9WgXcQ',
          controls: 1,
          disablekb: 0,
          fs: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: (event: any) => {
            event.target.unMute();
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              event.target.playVideo();
            }
          }
        }
      });
    };

    return () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-8 text-center bg-gradient-to-b from-gray-900 to-black text-white">
      <head>
        <title>🎵 You&apos;ve Been Rickrolled! 🎵</title>
        <meta name="description" content="Never gonna give you up, never gonna let you down..." />
      </head>
      
      <div className="max-w-4xl w-full">
        <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-600">
          🎵 RICK ASTLEY DELUXE 🎵
        </h1>
        
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl mb-8">
          <div className="aspect-w-16 aspect-h-9 w-full max-w-4xl mx-auto mb-6 rounded-lg overflow-hidden shadow-xl">
            <div ref={playerRef} className="w-full h-full" />
          </div>
          
          {isPlaying && (
            <div className="animate-bounce text-yellow-400 text-2xl mb-4">
              🎧 Put on your dancing shoes! 🕺
            </div>
          )}
          
          <div className="space-y-4 text-lg">
            <p>&#x1F3B5; You just got the full Rick Astley experience!</p>
            <p>&#x1F483; This is what peak performance looks like</p>
            <p className="text-yellow-300 font-mono">{/* TODO: Add more dance moves */}</p>
          </div>
          
          <div className="mt-8 p-4 bg-black/30 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Fun Facts About This Song:</h3>
            <ul className="text-left list-disc list-inside space-y-2">
              <li>Released in 1987 (older than some of your favorite developers)</li>
              <li>Has been viewed over 1.5 billion times on YouTube</li>
              <li>The official video features Rick&apos;s iconic dance moves</li>
              <li>You&apos;ll be humming this all day (you&apos;re welcome)</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-4">🎉 You&apos;ve Been Officially Rickrolled! 🎉</h2>
          <p className="mb-4">Share this page to spread the joy! (Or don&apos;t, we won&apos;t judge... much)</p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition">
              Share on Twitter
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition">
              Share on Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
