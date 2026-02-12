'use client';

import { useEffect, useState } from 'react';
import { bossImages } from '@/utils/bossImages';
import Image from 'next/image';

export default function Loading() {
    const [randomBoss, setRandomBoss] = useState<{ name: string; src: string } | null>(null);

    useEffect(() => {
        const keys = Object.keys(bossImages);
        if (keys.length > 0) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            setRandomBoss({ name: randomKey, src: bossImages[randomKey] });
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {randomBoss && (
                <div className="relative w-24 h-24 mb-4">
                    <Image
                        src={randomBoss.src}
                        alt="Loading..."
                        fill
                        className="object-contain animate-pulse"
                        unoptimized
                    />
                </div>
            )}
            <p className="text-secondary text-sm animate-pulse">Loading data...</p>
        </div>
    );
}
