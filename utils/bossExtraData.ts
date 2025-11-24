export interface BossLocation {
    x: number;
    y: number;
    z: number;
    description?: string;
}

export interface BossLootItem {
    name: string;
    image?: string;
}

export interface BossExtraInfo {
    loot?: BossLootItem[];
    locations?: BossLocation[];
}

export const bossExtraData: Record<string, BossExtraInfo> = {
    "Ghazbaran": {
        loot: [
            { name: "Golden Boots", image: "https://tibia.fandom.com/wiki/Special:FilePath/Golden_Boots.gif" },
            { name: "Twin Axe", image: "https://tibia.fandom.com/wiki/Special:FilePath/Twin_Axe.gif" },
            { name: "Ravenpoise", image: "https://tibia.fandom.com/wiki/Special:FilePath/Ravenpoise.gif" },
            { name: "Teddy Bear", image: "https://tibia.fandom.com/wiki/Special:FilePath/Teddy_Bear.gif" }
        ],
        locations: [
            { x: 32369, y: 32241, z: 7, description: "Formorgar Mines" }
        ]
    },
    "Morgaroth": {
        loot: [
            { name: "Thunder Hammer", image: "https://tibia.fandom.com/wiki/Special:FilePath/Thunder_Hammer.gif" },
            { name: "Chain Bolter", image: "https://tibia.fandom.com/wiki/Special:FilePath/Chain_Bolter.gif" },
            { name: "Great Shield", image: "https://tibia.fandom.com/wiki/Special:FilePath/Great_Shield.gif" },
            { name: "Molten Plate", image: "https://tibia.fandom.com/wiki/Special:FilePath/Molten_Plate.gif" }
        ],
        locations: [
            { x: 32865, y: 32285, z: 15, description: "Goroma Volcano" }
        ]
    },
    "Ferumbras": {
        loot: [
            { name: "Ferumbras' Hat", image: "https://tibia.fandom.com/wiki/Special:FilePath/Ferumbras'_Hat.gif" },
            { name: "Great Shield", image: "https://tibia.fandom.com/wiki/Special:FilePath/Great_Shield.gif" },
            { name: "Golden Boots", image: "https://tibia.fandom.com/wiki/Special:FilePath/Golden_Boots.gif" }
        ],
        locations: [
            { x: 33595, y: 31899, z: 6, description: "Ferumbras' Citadel" },

        ]
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
