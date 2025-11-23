export interface BossLocation {
    x: number;
    y: number;
    z: number;
    description?: string;
}

export interface BossExtraInfo {
    loot?: string[];
    location?: BossLocation;
}

export const bossExtraData: Record<string, BossExtraInfo> = {
    "Ghazbaran": {
        loot: ["Golden Boots", "Twin Axe", "Ravenpoise", "Teddy Bear"],
        location: { x: 32369, y: 32241, z: 7, description: "Formorgar Mines" }
    },
    "Morgaroth": {
        loot: ["Thunder Hammer", "Chain Bolter", "Great Shield", "Molten Plate"],
        location: { x: 32865, y: 32285, z: 15, description: "Goroma Volcano" }
    },
    "Ferumbras": {
        loot: ["Ferumbras' Hat", "Great Shield", "Golden Boots"],
        location: { x: 33269, y: 31533, z: 13, description: "Ferumbras' Citadel" }
    }
};

export function getBossExtraInfo(bossName: string): BossExtraInfo | null {
    // Try exact match
    if (bossExtraData[bossName]) {
        return bossExtraData[bossName];
    }

    // Try case-insensitive match
    const lowerName = bossName.toLowerCase();
    const key = Object.keys(bossExtraData).find(k => k.toLowerCase() === lowerName);
    return key ? bossExtraData[key] : null;
}
