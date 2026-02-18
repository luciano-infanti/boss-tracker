const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string
const connectionString = "postgres://postgres.fzovndomokzocesykxmi:QuN86khZCUT75HwD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

// Boss Categories
const BOSS_CATEGORIES = {
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
    ]
};

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Fetch aggregation from kill_history for accurate counts across all servers
        const resHistory = await client.query(`
            SELECT boss_name as name, SUM(count) as total_kills 
            FROM kill_history 
            GROUP BY boss_name 
            ORDER BY total_kills DESC
        `);
        const aggregatedStats = resHistory.rows;

        // Fetch list of all known bosses to include those with 0 kills
        const resBosses = await client.query('SELECT name FROM bosses');
        const knownBosses = resBosses.rows.map(b => b.name);

        const statsMap = new Map();
        aggregatedStats.forEach(stat => {
            // Postgres SUM returns a string for bigints/numbers usually, parse it
            statsMap.set(stat.name, parseInt(stat.total_kills, 10));
        });

        const creatures = [];
        const bosses = [];
        const allNames = new Set([...knownBosses, ...statsMap.keys()]);

        allNames.forEach(name => {
            const kills = statsMap.get(name) || 0;
            const entry = { name, kills };

            if (BOSS_CATEGORIES.Criaturas.includes(name)) {
                creatures.push(entry);
            } else {
                bosses.push(entry);
            }
        });

        // Ensure sorted descending by kills
        bosses.sort((a, b) => b.kills - a.kills);
        creatures.sort((a, b) => b.kills - a.kills);

        const output = {
            bosses,
            creatures
        };

        const outputPath = path.join(__dirname, '..', 'segmented_stats.json');
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

        console.log(`Successfully generated segmented stats to ${outputPath}`);
        console.log(`Total Bosses: ${bosses.length} (Top: ${bosses[0]?.name} with ${bosses[0]?.kills})`);
        console.log(`Total Creatures: ${creatures.length} (Top: ${creatures[0]?.name} with ${creatures[0]?.kills})`);

    } catch (err) {
        console.error('Error fetching data:', err);
    } finally {
        await client.end();
    }
}

main();
