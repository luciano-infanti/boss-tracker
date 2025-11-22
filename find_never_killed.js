
const fs = require('fs');

async function findNeverKilled() {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();

        if (!data.combined) {
            console.log('No combined data found');
            return;
        }

        const neverKilled = data.combined
            .filter(boss => boss.totalKills === 0)
            .map(boss => boss.name)
            .sort();

        console.log('Never Killed Bosses:');
        console.log(JSON.stringify(neverKilled, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

findNeverKilled();
