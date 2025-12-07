'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WORLDS } from '@/utils/constants';

interface WorldContextType {
    selectedWorld: string;
    setSelectedWorld: (world: string) => void;
    worlds: string[];
}

const WorldContext = createContext<WorldContextType | undefined>(undefined);

export function WorldProvider({ children }: { children: ReactNode }) {
    const [selectedWorld, setSelectedWorld] = useState<string>('');

    useEffect(() => {
        // Set first world as default
        if (WORLDS.length > 0 && !selectedWorld) {
            setSelectedWorld(WORLDS[0]);
        }
    }, [selectedWorld]);

    return (
        <WorldContext.Provider value={{ selectedWorld, setSelectedWorld, worlds: WORLDS }}>
            {children}
        </WorldContext.Provider>
    );
}

export function useWorld() {
    const context = useContext(WorldContext);
    if (context === undefined) {
        throw new Error('useWorld must be used within a WorldProvider');
    }
    return context;
}
