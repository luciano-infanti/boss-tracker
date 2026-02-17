export const SUPPRESSED_BOSSES = [
    "The Last Lore Keeper",
    "Gaz'haragoth",
    "Yakchal",
    "World Devourer",
    "Raxias",
    "Ferumbras Mortal Shell",
    "The First Dragon",
    "Devovorga",
    "Mahatheb",
    "Burster",
    "Irashae",
    "Anmothra",
    "Teneshpar",
    "Mad Mage",
    "Chikhaton",
    "Phrodomo",
    "Sir Leopold",
    "Dire Penguin",
    "The Manhunter",
    "The Mean Masher",
    "The Hungerer",
];

export const isSuppressed = (bossName: string): boolean => {
    return SUPPRESSED_BOSSES.some(b => b.toLowerCase() === bossName.toLowerCase());
};
