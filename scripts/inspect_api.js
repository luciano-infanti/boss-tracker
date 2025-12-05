const fetch = require('node-fetch');

async function inspectApi() {
    try {
        console.log('Fetching http://localhost:3000/api/data...');
        const res = await fetch('http://localhost:3000/api/data');
        const data = await res.json();

        console.log('--- YETI IN COMBINED ---');
        const yetiCombined = data.combined.find(b => b.name === 'Yeti');
        console.log(JSON.stringify(yetiCombined, null, 2));

        console.log('\n--- YETI IN KILL DATES ---');
        const yetiHistory = data.killDates.find(h => h.bossName === 'Yeti');
        console.log(JSON.stringify(yetiHistory, null, 2));

        console.log('\n--- YETI IN WORLDS ---');
        let foundInWorlds = false;
        for (const [world, bosses] of Object.entries(data.worlds)) {
            const yeti = bosses.find(b => b.name === 'Yeti');
            if (yeti) {
                console.log(`World: ${world}`);
                console.log(JSON.stringify(yeti, null, 2));
                foundInWorlds = true;
                break; // Just show one world
            }
        }
        if (!foundInWorlds) console.log('Yeti not found in any world.');

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectApi();
