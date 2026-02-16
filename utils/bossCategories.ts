
export type BossCategory = 'Archdemons' | 'POI' | 'Criaturas' | 'RubinOT' | 'Nemesis';

export const BOSS_CATEGORIES: Record<BossCategory, string[]> = {
    Archdemons: [
        "Gaz'haragoth", "Omrafir", "The Abomination", "Morshabaal",
        "Rotrender", "Orshabaal", "Morgaroth", "Ferumbras", "Ghazbaran"
    ],
    POI: [
        "The Imperor", "Mr. Punish", "The Handmaiden", "Massacre",
        "Countess Sorrow", "The Plasmother", "Dracola"
    ],
    Criaturas: [
        "Acolyte of Darkness",
        "Albino Dragon",
        "Bane Bringer",
        "Bane of Light",
        "Berrypest",
        "Bride of Night",
        "Cake Golem",
        "Crustacea Gigantica",
        "Crystal Wolf",
        "Diamond Servant",
        "Dire Penguin",
        "Doomsday Cultist",
        "Draptor",
        "Dryad",
        "Duskbringer",
        "Elf Overseer",
        "Goblin Leader",
        "Golden Servant",
        "Grynch Clan Goblin",
        "Herald of Gloom",
        "Iks Ahpututu",
        "Imperial",
        "Iron Servant",
        "Midnight Panther",
        "Midnight Spawn",
        "Midnight Warrior",
        "Nightfiend",
        "Nightslayer",
        "Raging Fire",
        "Shadow Hound",
        "Thornfire Wolf",
        "Troll Guard",
        "Undead Cavebear",
        "Undead Jester",
        "Vicious Manbat",
        "Water Buffalo",
        "Wild Horse",
        "Yeti"
    ],
    RubinOT: [
        "Frostbell", "Frostreaper"
    ],
    Nemesis: [] // Fallback category
};

export const BOSS_CATEGORY_ICONS: Record<Exclude<BossCategory, 'Nemesis'>, string> = {
    Archdemons: "https://www.tibiawiki.com.br/images/1/15/Bosstiary_Nemesis.png",
    POI: "https://www.tibiawiki.com.br/images/9/94/The_Holy_Tible.gif",
    Criaturas: "https://wiki.rubinot.com/icons/ranked-icon.gif",
    RubinOT: "/images/formulas/image.png"
};

// Categories hidden from results by default (must be explicitly toggled on)
export const HIDDEN_CATEGORIES: BossCategory[] = ['RubinOT'];

// All categories shown as filter pills
export const ALL_FILTER_CATEGORIES: BossCategory[] = ['Archdemons', 'POI', 'Criaturas', 'RubinOT'];

// Returns true if a boss belongs to a hidden-by-default category
export const isHiddenByDefault = (bossName: string): boolean => {
    const category = getBossCategory(bossName);
    return HIDDEN_CATEGORIES.includes(category);
};

export const getBossCategory = (bossName: string): BossCategory => {
    if (BOSS_CATEGORIES.Archdemons.includes(bossName)) return 'Archdemons';
    if (BOSS_CATEGORIES.POI.includes(bossName)) return 'POI';
    if (BOSS_CATEGORIES.Criaturas.includes(bossName)) return 'Criaturas';
    if (BOSS_CATEGORIES.RubinOT.includes(bossName)) return 'RubinOT';
    return 'Nemesis';
};
