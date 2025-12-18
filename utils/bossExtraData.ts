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
    wiki?: string;
    eventTag?: string;
}

export const bossExtraData: Record<string, BossExtraInfo> = {
    "Albino Dragon": { wiki: "https://www.tibiawiki.com.br/wiki/Albino_Dragon" },
    "Apprentice Sheng": { wiki: "https://www.tibiawiki.com.br/wiki/Apprentice_Sheng" },
    "Arachir the Ancient One": { wiki: "https://www.tibiawiki.com.br/wiki/Arachir_the_Ancient_One" },
    "Arthom the Hunter": { wiki: "https://www.tibiawiki.com.br/wiki/Arthom_the_Hunter" },
    "Barbaria": { wiki: "https://www.tibiawiki.com.br/wiki/Barbaria" },
    "Battlemaster Zunzu": { wiki: "https://www.tibiawiki.com.br/wiki/Battlemaster_Zunzu" },
    "Big Boss Trolliver": { wiki: "https://www.tibiawiki.com.br/wiki/Big_Boss_Trolliver" },
    "Burster": { wiki: "https://www.tibiawiki.com.br/wiki/Burster" },
    "Captain Jones": { wiki: "https://www.tibiawiki.com.br/wiki/Captain_Jones" },
    "Chizzoron the Distorter": { wiki: "https://www.tibiawiki.com.br/wiki/Chizzoron_the_Distorter" },
    "Chopper": { wiki: "https://www.tibiawiki.com.br/wiki/Chopper" },
    "Countess Sorrow": { wiki: "https://www.tibiawiki.com.br/wiki/Countess_Sorrow" },
    "Crustacea Gigantica": { wiki: "https://www.tibiawiki.com.br/wiki/Crustacea_Gigantica" },
    "Cublarc the Plunderer": { wiki: "https://www.tibiawiki.com.br/wiki/Cublarc_the_Plunderer" },
    "Dharalion": { wiki: "https://www.tibiawiki.com.br/wiki/Dharalion" },
    "Diblis the Fair": { wiki: "https://www.tibiawiki.com.br/wiki/Diblis_the_Fair" },
    "Dracola": { wiki: "https://www.tibiawiki.com.br/wiki/Dracola" },
    "Draptor": { wiki: "https://www.tibiawiki.com.br/wiki/Draptor" },
    "Dreadful Disruptor": { wiki: "https://www.tibiawiki.com.br/wiki/Dreadful_Disruptor" },
    "Dreadmaw": { wiki: "https://www.tibiawiki.com.br/wiki/Dreadmaw" },
    "Elvira Hammerthrust": { wiki: "https://www.tibiawiki.com.br/wiki/Elvira_Hammerthrust" },
    "Fernfang": { wiki: "https://www.tibiawiki.com.br/wiki/Fernfang" },
    "Feroxa": { wiki: "https://www.tibiawiki.com.br/wiki/Feroxa_(Mortal)" },
    "Frostreaper": { eventTag: "Natal 2025" },
    "Frostbell": { eventTag: "Natal 2025" },
    "Ferumbras": {
        wiki: "https://www.tibiawiki.com.br/wiki/Ferumbras",
        loot: [
            { name: "Ferumbras' Hat", image: "https://tibia.fandom.com/wiki/Special:FilePath/Ferumbras'_Hat.gif" },
            { name: "Great Shield", image: "https://tibia.fandom.com/wiki/Special:FilePath/Great_Shield.gif" },
            { name: "Golden Boots", image: "https://tibia.fandom.com/wiki/Special:FilePath/Golden_Boots.gif" }
        ],
        locations: [
            { x: 33595, y: 31899, z: 6, description: "Ferumbras' Citadel" },
        ]
    },
    "Flamecaller Zazrak": { wiki: "https://www.tibiawiki.com.br/wiki/Flamecaller_Zazrak" },
    "Fleabringer": { wiki: "https://www.tibiawiki.com.br/wiki/Fleabringer" },
    "Foreman Kneebiter": { wiki: "https://www.tibiawiki.com.br/wiki/Foreman_Kneebiter" },
    "Furyosa": { wiki: "https://www.tibiawiki.com.br/wiki/Furyosa" },
    "Gaz'haragoth": { wiki: "https://www.tibiawiki.com.br/wiki/Gaz%27Haragoth" },
    "General Murius": { wiki: "https://www.tibiawiki.com.br/wiki/General_Murius" },
    "Ghazbaran": {
        wiki: "https://www.tibiawiki.com.br/wiki/Ghazbaran",
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
    "Grand Mother Foulscale": { wiki: "https://www.tibiawiki.com.br/wiki/Grand_Mother_Foulscale" },
    "Grandfather Tridian": { wiki: "https://www.tibiawiki.com.br/wiki/Grandfather_Tridian" },
    "Gravelord Oshuran": { wiki: "https://www.tibiawiki.com.br/wiki/Gravelord_Oshuran" },
    "Groam": { wiki: "https://www.tibiawiki.com.br/wiki/Groam" },
    "Grorlam": { wiki: "https://www.tibiawiki.com.br/wiki/Grorlam" },
    "Hairman the Huge": { wiki: "https://www.tibiawiki.com.br/wiki/Hairman_The_Huge" },
    "Hatebreeder": { wiki: "https://www.tibiawiki.com.br/wiki/Hatebreeder" },
    "High Templar Cobrass": { wiki: "https://www.tibiawiki.com.br/wiki/High_Templar_Cobrass" },
    "Hirintror": { wiki: "https://www.tibiawiki.com.br/wiki/Hirintror" },
    "Jesse the Wicked": { wiki: "https://www.tibiawiki.com.br/wiki/Jesse_the_Wicked" },
    "Lizard Gate Guardian": { wiki: "https://www.tibiawiki.com.br/wiki/Lizard_Gate_Guardian" },
    "Mahatheb": { wiki: "https://www.tibiawiki.com.br/wiki/Mahatheb" },
    "Man in the Cave": { wiki: "https://www.tibiawiki.com.br/wiki/Man_In_The_Cave" },
    "Massacre": { wiki: "https://www.tibiawiki.com.br/wiki/Massacre" },
    "Maw": { wiki: "https://www.tibiawiki.com.br/wiki/Maw" },
    "Midnight Panther": { wiki: "https://www.tibiawiki.com.br/wiki/Midnight_Panther" },
    "Mindmasher": { wiki: "https://www.tibiawiki.com.br/wiki/Mindmasher" },
    "Morgaroth": {
        wiki: "https://www.tibiawiki.com.br/wiki/Morgaroth",
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
    "Mornenion": { wiki: "https://www.tibiawiki.com.br/wiki/Mornenion" },
    "Morshabaal": { wiki: "https://www.tibiawiki.com.br/wiki/Morshabaal" },
    "Mr. Punish": { wiki: "https://www.tibiawiki.com.br/wiki/Mr._Punish" },
    "Munster": { wiki: "https://www.tibiawiki.com.br/wiki/Munster" },
    "Ocyakao": { wiki: "https://www.tibiawiki.com.br/wiki/Ocyakao" },
    "Omrafir": { wiki: "https://www.tibiawiki.com.br/wiki/Omrafir" },
    "Oodok Witchmaster": { wiki: "https://www.tibiawiki.com.br/wiki/Oodok_Witchmaster" },
    "Orshabaal": { wiki: "https://www.tibiawiki.com.br/wiki/Orshabaal" },
    "Robby the Reckless": { wiki: "https://www.tibiawiki.com.br/wiki/Robby_the_Reckless" },
    "Rotrender": { wiki: "https://www.tibiawiki.com.br/wiki/Rotrender" },
    "Rotspit": { wiki: "https://www.tibiawiki.com.br/wiki/Rotspit" },
    "Rottie the Rotworm": { wiki: "https://www.tibiawiki.com.br/wiki/Rottie_the_Rotworm" },
    "Rotworm Queen": { wiki: "https://www.tibiawiki.com.br/wiki/Rotworm_Queen" },
    "Rukor Zad": { wiki: "https://www.tibiawiki.com.br/wiki/Rukor_Zad" },
    "Shadowstalker": { wiki: "https://www.tibiawiki.com.br/wiki/Shadowstalker" },
    "Shlorg": { wiki: "https://www.tibiawiki.com.br/wiki/Shlorg" },
    "Sir Leopold": { wiki: "https://www.tibiawiki.com.br/wiki/Sir_Leopold" },
    "Sir Valorcrest": { wiki: "https://www.tibiawiki.com.br/wiki/Sir_Valorcrest" },
    "Smuggler Baron Silvertoe": { wiki: "https://www.tibiawiki.com.br/wiki/Smuggler_Baron_Silvertoe" },
    "Teleskor": { wiki: "https://www.tibiawiki.com.br/wiki/Teleskor" },
    "Teneshpar": { wiki: "https://www.tibiawiki.com.br/wiki/Teneshpar" },
    "The Abomination": { wiki: "https://www.tibiawiki.com.br/wiki/The_Abomination" },
    "The Big Bad One": { wiki: "https://www.tibiawiki.com.br/wiki/The_Big_Bad_One" },
    "The Blightfather": { wiki: "https://www.tibiawiki.com.br/wiki/The_Blightfather" },
    "The Evil Eye": { wiki: "https://www.tibiawiki.com.br/wiki/The_Evil_Eye" },
    "The Frog Prince": { wiki: "https://www.tibiawiki.com.br/wiki/The_Frog_Prince" },
    "The Handmaiden": { wiki: "https://www.tibiawiki.com.br/wiki/The_Handmaiden" },
    "The Hungerer": { wiki: "https://www.tibiawiki.com.br/wiki/The_Hungerer" },
    "The Imperor": { wiki: "https://www.tibiawiki.com.br/wiki/The_Imperor" },
    "The Manhunter": { wiki: "https://www.tibiawiki.com.br/wiki/The_Manhunter" },
    "The Mean Masher": { wiki: "https://www.tibiawiki.com.br/wiki/The_Mean_Masher" },
    "The Old Whopper": { wiki: "https://www.tibiawiki.com.br/wiki/The_Old_Whopper" },
    "The Pale Count": { wiki: "https://www.tibiawiki.com.br/wiki/The_Pale_Count" },
    "The Plasmother": { wiki: "https://www.tibiawiki.com.br/wiki/The_Plasmother" },
    "The Voice of Ruin": { wiki: "https://www.tibiawiki.com.br/wiki/The_Voice_of_Ruin" },
    "The Welter": { wiki: "https://www.tibiawiki.com.br/wiki/The_Welter" },
    "Tyrn": { wiki: "https://www.tibiawiki.com.br/wiki/Tyrn" },
    "Tzumrah the Dazzler": { wiki: "https://www.tibiawiki.com.br/wiki/Tzumrah_the_Dazzler" },
    "Undead Cavebear": { wiki: "https://www.tibiawiki.com.br/wiki/Undead_Cavebear" },
    "Warlord Ruzad": { wiki: "https://www.tibiawiki.com.br/wiki/Warlord_Ruzad" },
    "White Pale": { wiki: "https://www.tibiawiki.com.br/wiki/White_Pale" },
    "Willi Wasp": { wiki: "https://www.tibiawiki.com.br/wiki/Willi_Wasp" },
    "Xenia": { wiki: "https://www.tibiawiki.com.br/wiki/Xenia" },
    "Yaga the Crone": { wiki: "https://www.tibiawiki.com.br/wiki/Yaga_the_Crone" },
    "Yakchal": { wiki: "https://www.tibiawiki.com.br/wiki/Yakchal" },
    "Yeti": { wiki: "https://www.tibiawiki.com.br/wiki/Yeti" },
    "Zarabustor": { wiki: "https://www.tibiawiki.com.br/wiki/Zarabustor" },
    "Zevelon Duskbringer": { wiki: "https://www.tibiawiki.com.br/wiki/Zevelon_Duskbringer" },
    "Zomba": { wiki: "https://www.tibiawiki.com.br/wiki/Zomba" },
    "Zulazza the Corruptor": { wiki: "https://www.tibiawiki.com.br/wiki/Zulazza_the_Corruptor" },
    "Zushuka": { wiki: "https://www.tibiawiki.com.br/wiki/Zushuka" }
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
