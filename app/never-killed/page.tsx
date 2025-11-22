'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';

export default function NeverKilledPage() {
    const { data } = useData();
    const [neverKilled, setNeverKilled] = useState<string[]>([]);

    useEffect(() => {
        if (data.combined) {
            const list = data.combined
                .filter(b => b.totalKills === 0)
                .map(b => b.name)
                .sort();
            setNeverKilled(list);
        }
    }, [data]);

    return (
        <div className="p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">Never Killed Bosses</h1>
            <ul className="list-disc pl-5">
                {neverKilled.map(name => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </div>
    );
}
