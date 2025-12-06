// Script to check which bosses have data
async function main() {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();

        console.log('Checking for Ocyakao and Sir Valocrest...\n');

        // Check these specific bosses
        const bossesToCheck = ['Ocyakao', 'Sir Valocrest'];

        bossesToCheck.forEach(boss => {
            const bossData = data.killDates[boss];
            console.log(`${boss}:`);
            if (!bossData || !bossData.worlds) {
                console.log('  ❌ No data available\n');
            } else {
                console.log('  ✅ Has data');
                console.log('  Worlds:', Object.keys(bossData.worlds).join(', '));
                Object.entries(bossData.worlds).forEach(([world, history]) => {
                    console.log(`    ${world}: ${history}`);
                });
                console.log('');
            }
        });

        // Find some bosses that DO have data for demonstration
        console.log('\nLooking for bosses with rich data for demonstration...\n');
        const bossesWithData = [];
        Object.entries(data.killDates).forEach(([bossName, bossData]) => {
            if (bossData && bossData.worlds) {
                const worldCount = Object.keys(bossData.worlds).length;
                const hasMultipleKills = Object.values(bossData.worlds).some(history => {
                    if (!history || history === 'No kills recorded') return false;
                    const dateMatches = history.match(/\d{2}\/\d{2}\/\d{4}/g);
                    return dateMatches && dateMatches.length >= 3;
                });

                if (hasMultipleKills && worldCount >= 2) {
                    bossesWithData.push({ name: bossName, worldCount });
                }
            }
        });

        bossesWithData.sort((a, b) => b.worldCount - a.worldCount);
        console.log('Top 5 bosses with multi-world data:');
        bossesWithData.slice(0, 5).forEach(boss => {
            console.log(`  - ${boss.name} (${boss.worldCount} worlds)`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
