'use client';

import { useState, useEffect } from 'react';

interface Snowflake {
  id: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function Snowflakes({ count = 30 }: { count?: number }) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only generate snowflakes on client side to avoid hydration mismatch
    const flakes = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.4,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * -20,
      drift: -20 + Math.random() * 40,
    }));
    setSnowflakes(flakes);
    setMounted(true);
  }, [count]);

  // Don't render anything on server or before mount
  if (!mounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) translateX(0);
          }
          100% {
            transform: translateY(100vh) translateX(var(--drift));
          }
        }
      `}</style>
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 9999 }}
        aria-hidden="true"
      >
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${flake.left}%`,
              top: '-10px',
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animation: `snowfall ${flake.duration}s linear infinite`,
              animationDelay: `${flake.delay}s`,
              ['--drift' as string]: `${flake.drift}px`,
            }}
          />
        ))}
      </div>
    </>
  );
}

