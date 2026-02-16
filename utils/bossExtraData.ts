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
    description?: string;
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
    "Zushuka": { wiki: "https://www.tibiawiki.com.br/wiki/Zushuka" },
    "Acolyte of Darkness": {
        wiki: "https://www.tibiawiki.com.br/wiki/Acolyte_of_Darkness",
        description: "Tem a mesma aparência de um Necromancer. Aparece em quantidade próximos à basins durante o evento que ocorre em novembro. Faz parte do evento Lightbearer."
    },
    "Bane Bringer": {
        wiki: "https://www.tibiawiki.com.br/wiki/Bane_Bringer",
        description: "Tem a mesma aparência de um Haunted Treeling. Apenas ataques físicos causam danos significativos nessas criaturas. Faz parte da World Quest Bewitched."
    },
    "Bane of Light": {
        wiki: "https://www.tibiawiki.com.br/wiki/Bane_of_Light",
        description: "Tem a mesma aparência de um Vampire. Aparece em quantidade próximos a basins durante o evento que ocorre em novembro, The Lightbearer"
    },
    "Berrypest": {
        wiki: "https://www.tibiawiki.com.br/wiki/Berrypest",
        description: "Essa criatura aparece durante a Annual Autumn Vintage."
    },
    "Bride of Night": {
        wiki: "https://www.tibiawiki.com.br/wiki/Bride_of_Night",
        description: "Faz parte do evento Lightbearer."
    },
    "Cake Golem": {
        wiki: "https://www.tibiawiki.com.br/wiki/Cake_Golem",
        description: "Esta criatura faz parte da World Quest A Piece of Cake. Note que eles só aparecem durante a primeira parte da quest."
    },
    "Crystal Wolf": {
        wiki: "https://www.tibiawiki.com.br/wiki/Crystal_Wolf",
        description: "Para encontrá-lo, lure um Thornfire Wolf até a água sagrada no Bog Temple, durante a Thornfire World Change. Pode ser domada com um Diapason"
    },
    "Diamond Servant": { wiki: "https://www.tibiawiki.com.br/wiki/Diamond_Servant" },
    "Dire Penguin": { wiki: "https://www.tibiawiki.com.br/wiki/Dire_Penguin" },
    "Doomsday Cultist": {
        wiki: "https://www.tibiawiki.com.br/wiki/Doomsday_Cultist",
        description: "Faz parte do evento Lightbearer."
    },
    "Dryad": {
        wiki: "https://www.tibiawiki.com.br/wiki/Dryad",
        description: "Faz raras invasões durante o ano nos Dryad Gardens. Durante o evento Flower Month, fazem invasões nas florestas de Ab'Dendriel, Carlin, Edron, Port Hope, além de seus próprios jardins em Cormaya. Quando as invasões são anunciadas elas duram 1 hora e as waves são num total de cinco, sendo a primeira quando aparece a mensagem, e as 4 seguintes a cada 15 minutos."
    },
    "Duskbringer": {
        wiki: "https://www.tibiawiki.com.br/wiki/Duskbringer",
        description: "Faz parte do evento Lightbearer."
    },
    "Elf Overseer": {
        wiki: "https://www.tibiawiki.com.br/wiki/Elf_Overseer",
        description: "São eles quem vigiam os Firestarters em Shadowthorn. Você precisa matá-los durante o 1º estágio da Thornfire World Change para incendiar a fortaleza e libertar os Firestarters."
    },
    "Goblin Leader": {
        wiki: "https://www.tibiawiki.com.br/wiki/Goblin_Leader",
        description: "O Goblin Leader encontrado em Femor Hills faz parte da Tower Defence Quest."
    },
    "Golden Servant": { wiki: "https://www.tibiawiki.com.br/wiki/Golden_Servant" },
    "Grynch Clan Goblin": {
        wiki: "https://www.tibiawiki.com.br/wiki/Grynch_Clan_Goblin",
        description: "Aparecem aleatoriamente em invasões, eles são anunciados quando estão roubando presentes de uma cidade aleatória do Tibia: 'Goblins of the infamous Grynch Clan are invading xxxx to steal all presents, beware!' Faz parte do Santa Event."
    },
    "Herald of Gloom": {
        wiki: "https://www.tibiawiki.com.br/wiki/Herald_of_Gloom",
        description: "Faz parte do evento Lightbearer."
    },
    "Iks Ahpututu": { wiki: "https://www.tibiawiki.com.br/wiki/Iks_Ahpututu" },
    "Imperial": {
        wiki: "https://www.tibiawiki.com.br/wiki/Imperial",
        description: "Criatura de respawn aleatório encontrada ao longo da Isle of Ada. No mesmo SQM podem surgir Deers, Stags ou, de forma mais rara, o Imperial."
    },
    "Iron Servant": { wiki: "https://www.tibiawiki.com.br/wiki/Iron_Servant" },
    "Mad Mage": {
        wiki: "https://www.tibiawiki.com.br/wiki/Mad_Mage",
        description: "Faz parte da Their Master's Voice World Change. Para ele aparecer, você deve limpar os fungos da caverna e matar os 20 respawns de golens."
    },
    "Midnight Spawn": {
        wiki: "https://www.tibiawiki.com.br/wiki/Midnight_Spawn",
        description: "Faz parte do evento Lightbearer."
    },
    "Midnight Warrior": {
        wiki: "https://www.tibiawiki.com.br/wiki/Midnight_Warrior",
        description: "Faz parte do evento Lightbearer."
    },
    "Nightfiend": { wiki: "https://www.tibiawiki.com.br/wiki/Nightfiend" },
    "Nightslayer": {
        wiki: "https://www.tibiawiki.com.br/wiki/Nightslayer",
        description: "Faz parte do evento Lightbearer."
    },
    "Raging Fire": { wiki: "https://www.tibiawiki.com.br/wiki/Raging_Fire" },
    "Shadow Hound": {
        wiki: "https://www.tibiawiki.com.br/wiki/Shadow_Hound",
        description: "Faz parte do evento Lightbearer."
    },
    "Thornfire Wolf": {
        wiki: "https://www.tibiawiki.com.br/wiki/Thornfire_Wolf",
        description: "Para encontrar esta criatura, apague as chamas em Shadowthorn durante a Thornfire World Change."
    },
    "Troll Guard": {
        wiki: "https://www.tibiawiki.com.br/wiki/Troll_Guard",
        description: "Faz raras invasões no noroeste de Carlin e durante invasões na arena de Thais. As invasões na arena de Thais só ocorrem durante a Mini World Change Thais Kingsday."
    },
    "Undead Jester": {
        wiki: "https://www.tibiawiki.com.br/wiki/Undead_Jester",
        description: "As invasões de Undead Jesters aparecem como uma parte do evento 'April Month of Pranks'. Elas começam no dia 1º de Abril e se estendem até o server save do dia 15 de Abril. Invasões acontecem em qualquer cidade, a qualquer hora. Nunca se pode prever uma invasão. Usar Dwarven Ring é uma boa idéia, caso contrário, você gastará muito tempo correndo atrás deles."
    },
    "Vicious Manbat": { wiki: "https://www.tibiawiki.com.br/wiki/Vicious_Manbat" },
    "Water Buffalo": {
        wiki: "https://www.tibiawiki.com.br/wiki/Water_Buffalo",
        description: "Pequenos grupos de 2 a 6 Water Buffalos podem ser encontrados em Marshland, a cada 4 horas a partir do server save."
    },
    "Wild Horse": {
        wiki: "https://www.tibiawiki.com.br/wiki/Wild_Horse",
        description: "0-3 Wild Horses vão aparecer a cada três horas (a partir do server save), durante a Horse Station World Change."
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

export function normalizeBossName(bossName: string): string {
    // Try exact match first
    if (bossExtraData[bossName]) return bossName;

    // Try case-insensitive match
    const lowerName = bossName.toLowerCase();
    const key = Object.keys(bossExtraData).find(k => k.toLowerCase() === lowerName);

    return key || bossName;
}
