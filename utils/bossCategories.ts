
export type BossCategory = 'Archdemons' | 'Rookgaard' | 'Pits of Inferno' | 'Creatures' | 'Nemesis';

export const BOSS_CATEGORIES: Record<BossCategory, string[]> = {
    Archdemons: [
        "Gaz'haragoth", "Omrafir", "The Abomination", "Morshabaal",
        "Rotrender", "Orshabaal", "Morgaroth", "Ferumbras", "Ghazbaran"
    ],
    Rookgaard: [
        "Teleskor", "Rottie the Rotworm", "Munster", "Apprentice Sheng"
    ],
    'Pits of Inferno': [
        "The Imperor", "Mr. Punish", "The Handmaiden", "Massacre",
        "Countess Sorrow", "The Plasmother", "Dracola"
    ],
    Creatures: [
        "Yeti", "Crustacea Gigantica", "Midnight Panther", "Draptor"
    ],
    Nemesis: [] // Fallback category
};

export const BOSS_CATEGORY_ICONS: Record<Exclude<BossCategory, 'Nemesis'>, string> = {
    Archdemons: "https://www.tibiawiki.com.br/images/1/15/Bosstiary_Nemesis.png",
    Rookgaard: "https://www.tibiawiki.com.br/images/1/19/Spike_Sword_%28Old2%29.gif",
    'Pits of Inferno': "https://www.tibiawiki.com.br/images/9/94/The_Holy_Tible.gif",
    Creatures: "https://wiki.rubinot.com/icons/ranked-icon.gif"
};

export const getBossCategory = (bossName: string): BossCategory => {
    if (BOSS_CATEGORIES.Archdemons.includes(bossName)) return 'Archdemons';
    if (BOSS_CATEGORIES.Rookgaard.includes(bossName)) return 'Rookgaard';
    if (BOSS_CATEGORIES['Pits of Inferno'].includes(bossName)) return 'Pits of Inferno';
    if (BOSS_CATEGORIES.Creatures.includes(bossName)) return 'Creatures';
    return 'Nemesis';
};
