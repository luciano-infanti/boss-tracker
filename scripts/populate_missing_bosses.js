const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fzovndomokzocesykxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3ZuZG9tb2t6b2Nlc3lreG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1NTQxNiwiZXhwIjoyMDc5ODMxNDE2fQ.57Hlt2CaLCZ1qVCnw8noHAJMAqg8AaA6DMOPrtJeHMI";

const supabase = createClient(supabaseUrl, supabaseKey);

const knownBosses = [
    "Albino Dragon", "Apprentice Sheng", "Arachir the Ancient One", "Arthom the Hunter", "Barbaria",
    "Battlemaster Zunzu", "Big Boss Trolliver", "Burster", "Captain Jones", "Chizzoron the Distorter",
    "Chopper", "Countess Sorrow", "Crustacea Gigantica", "Cublarc the Plunderer", "Dharalion",
    "Diblis the Fair", "Dracola", "Draptor", "Dreadful Disruptor", "Dreadmaw", "Elvira Hammerthrust",
    "Fernfang", "Feroxa", "Ferumbras", "Flamecaller Zazrak", "Fleabringer", "Foreman Kneebiter",
    "Furyosa", "Gaz'haragoth", "General Murius", "Ghazbaran", "Grand Mother Foulscale",
    "Grandfather Tridian", "Gravelord Oshuran", "Groam", "Grorlam", "Hairman the Huge", "Hatebreeder",
    "High Templar Cobrass", "Hirintror", "Jesse the Wicked", "Lizard Gate Guardian", "Mahatheb",
    "Man in the Cave", "Massacre", "Maw", "Midnight Panther", "Mindmasher", "Morgaroth", "Mornenion",
    "Morshabaal", "Mr. Punish", "Munster", "Ocyakao", "Omrafir", "Oodok Witchmaster", "Orshabaal",
    "Robby the Reckless", "Rotrender", "Rotspit", "Rottie the Rotworm", "Rotworm Queen", "Rukor Zad",
    "Shadowstalker", "Shlorg", "Sir Leopold", "Sir Valorcrest", "Smuggler Baron Silvertoe", "Teleskor",
    "Teneshpar", "The Abomination", "The Big Bad One", "The Blightfather", "The Evil Eye",
    "The Frog Prince", "The Handmaiden", "The Hungerer", "The Imperor", "The Manhunter",
    "The Mean Masher", "The Old Whopper", "The Pale Count", "The Plasmother", "The Voice of Ruin",
    "The Welter", "Tyrn", "Tzumrah the Dazzler", "Undead Cavebear", "Warlord Ruzad", "White Pale",
    "Willi Wasp", "Xenia", "Yaga the Crone", "Yakchal", "Yeti", "Zarabustor", "Zevelon Duskbringer",
    "Zomba", "Zulazza the Corruptor", "Zushuka", "Alptramun", "Anmothra", "Bakragore", "Bane Lord",
    "Chikhaton", "Devovorga", "Ferumbras Mortal Shell", "Goshnar's Megalomania", "Horestis",
    "Irahsae", "Izcandar Champion of Summer", "Izcandar Champion of Winter", "Izcandar the Banished",
    "King Chuck", "Malofur Mangrinder", "Maxxenius", "Phrodomo", "Plagueroot", "Raxias",
    "The First Dragon (Criatura)", "The Last Lore Keeper", "The Mutated Pumpkin", "The Percht Queen",
    "World Devourer"
];

async function populateMissing() {
    console.log('Fetching existing bosses...');
    const { data: existing, error } = await supabase.from('bosses').select('name');

    if (error) {
        console.error('Error fetching bosses:', error);
        return;
    }

    const existingNames = new Set(existing.map(b => b.name.toLowerCase()));
    const missing = [];

    for (const name of knownBosses) {
        if (!existingNames.has(name.toLowerCase())) {
            missing.push({
                name: name,
                total_days_spawned: 0,
                total_kills: 0,
                spawn_frequency: 'Unknown',
                next_expected_spawn: 'Unknown',
                last_kill_date: 'Never',
                history: '',
                stats: { perWorldStats: [] }
            });
        }
    }

    console.log(`Found ${missing.length} missing bosses.`);

    if (missing.length > 0) {
        const { error: insertError } = await supabase.from('bosses').insert(missing);
        if (insertError) {
            console.error('Error inserting bosses:', insertError);
        } else {
            console.log('Successfully inserted missing bosses.');
        }
    } else {
        console.log('No missing bosses to insert.');
    }
}

populateMissing();
