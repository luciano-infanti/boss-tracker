import React from 'react';

interface BossMapIframeProps {
    x: number;
    y: number;
    z: number;
    name?: string; // Optional: just for your own reference
}

export default function BossMapIframe({ x, y, z, name }: BossMapIframeProps) {
    // 1. Construct the URL dynamically
    // Format: https://tibiamaps.io/map/embed#32369,32241,7:2
    const mapUrl = `https://tibiamaps.io/map/embed#${x},${y},${z}:2`;

    return (
        <div className="w-full h-[400px] overflow-hidden rounded-md border border-gray-700 bg-black">
            <iframe
                src={mapUrl}
                title={`Map location of ${name}`}
                width="100%"
                height="100%"
                className="border-none block"
                loading="lazy" // Good for performance if you have many maps
                allowFullScreen
            />

            {/* Optional: Add a "Open in TibiaMaps" link below */}
            <div className="bg-gray-900 text-white text-xs p-2 text-right">
                <a
                    href={mapUrl.replace('/embed', '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-400"
                >
                    Open in TibiaMaps.io ↗
                </a>
            </div>
        </div>
    );
}
