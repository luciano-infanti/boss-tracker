// Test the parser with actual Yeti data
const sampleFile = `Boss: Yeti
Status: ✅ KILLED TODAY (3 kills)
Total Days Spawned: 4
Total Kills: 35
Spawn Frequency: once every ~3.7 days
Next Expected Spawn: 04/12/2025
History: 20/11/2025 (1x), 22/11/2025 (3x), 24/11/2025 (28x), 01/12/2025 (3x)
---
Boss: Draptor
Total Days Spawned: 2
Total Kills: 6
Spawn Frequency: once every ~4.5 days
Next Expected Spawn: 05/12/2025
History: 27/11/2025 (3x), 01/12/2025 (3x)
---`;

// Import the parser
function parseSingleWorldFile(content) {
  const bosses = [];
  const records = content.split('---').filter(r => r.trim());

  for (const record of records) {
    const lines = record.trim().split('\n');
    const boss = {
      totalDaysSpawned: 0,
      totalKills: 0,
      spawnFrequency: 'N/A',
      nextExpectedSpawn: 'N/A',
      lastKillDate: 'Never',
      history: 'None'
    };

    for (const line of lines) {
      if (line.startsWith('Boss:')) {
        boss.name = line.replace('Boss:', '').trim();
      } else if (line.startsWith('Total Days Spawned:')) {
        const val = parseInt(line.split(':')[1].trim());
        boss.totalDaysSpawned = isNaN(val) ? 0 : val;
      } else if (line.startsWith('Total Kills:')) {
        const val = parseInt(line.split(':')[1].trim());
        boss.totalKills = isNaN(val) ? 0 : val;
      } else if (line.startsWith('Spawn Frequency:')) {
        const boss.spawnFrequency = line.split(':')[1].trim();
      } else if (line.startsWith('Next Expected Spawn:')) {
        boss.nextExpectedSpawn = line.split(':')[1].trim();
      } else if (line.startsWith('Last Kill Date:')) {
        boss.lastKillDate = line.split(':')[1].trim();
      } else if (line.startsWith('History:')) {
        boss.history = line.split(':')[1].trim();
      }
    }

    if (boss.name) {
      bosses.push(boss);
    }
  }

  return bosses;
}

console.log('Testing parser with Yeti data:');
const result = parseSingleWorldFile(sampleFile);
console.log(JSON.stringify(result, null, 2));

result.forEach(boss => {
  console.log(`\n${boss.name}:`);
  console.log(`  totalKills: ${boss.totalKills}`);
  console.log(`  history: ${boss.history}`);
});
