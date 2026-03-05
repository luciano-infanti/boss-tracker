/**
 * Fetch predictions data from local dev server and print window comparison.
 * Run with: node scripts/check-windows.mjs
 */

const CREATURES = [
  "Acolyte of Darkness", "Albino Dragon", "Bane Bringer", "Bane of Light",
  "Berrypest", "Bride of Night", "Cake Golem", "Crustacea Gigantica",
  "Crystal Wolf", "Diamond Servant", "Dire Penguin", "Doomsday Cultist",
  "Draptor", "Dryad", "Duskbringer", "Elf Overseer", "Goblin Leader",
  "Golden Servant", "Grynch Clan Goblin", "Herald of Gloom", "Iks Ahpututu",
  "Imperial", "Iron Servant", "Midnight Panther", "Midnight Spawn",
  "Midnight Warrior", "Nightfiend", "Nightslayer", "Raging Fire",
  "Shadow Hound", "Thornfire Wolf", "Troll Guard", "Undead Cavebear",
  "Undead Jester", "Vicious Manbat", "Water Buffalo", "Wild Horse", "Yeti"
];

async function main() {
  console.log('Fetching data from local dev server...');
  const res = await fetch('http://localhost:3000/api/data');
  const data = await res.json();

  if (!data.killDates) {
    console.error('No killDates in response');
    process.exit(1);
  }

  // Dynamically import the spawnLogic (it's TypeScript, so we'll use tsx or just replicate the logic)
  // Instead, let's just use the API data to build KillRecords and instantiate SpawnPredictor
  // Since this is ESM and the source is TS, we'll do it inline

  const killDates = data.killDates;
  const worlds = Object.keys(data.worlds || {});

  // Build kill records
  const kills = [];
  killDates.forEach(boss => {
    Object.entries(boss.killsByWorld).forEach(([world, entries]) => {
      entries.forEach(entry => {
        kills.push({
          bossName: boss.bossName,
          world: world,
          killedAt: entry.date
        });
      });
    });
  });

  // Get unique boss names that are NOT creatures (i.e., shown on previsoes)
  const allBosses = [...new Set(killDates.map(k => k.bossName))];
  const predictedBosses = allBosses.filter(b => !CREATURES.includes(b));

  console.log(`\nTotal bosses: ${allBosses.length}`);
  console.log(`Predicted (non-creature): ${predictedBosses.length}`);
  console.log(`Worlds: ${worlds.join(', ')}\n`);

  // We can't easily import the TS SpawnPredictor from ESM, so let's call the page and 
  // scrape the predictions. Instead, let's just print what the API gives us about each boss
  // by checking kill history patterns.
  
  // Actually, the easiest approach is to use tsx to run TypeScript directly:
  console.log('To get full prediction data, run: npx tsx scripts/check-windows-full.ts');
  
  // For now, print boss kill summary
  console.log('Boss Name'.padEnd(30) + 'Worlds  Last Kill');
  console.log('-'.repeat(70));
  predictedBosses.sort().forEach(bossName => {
    const boss = killDates.find(k => k.bossName === bossName);
    if (!boss) return;
    const worldCount = Object.keys(boss.killsByWorld).length;
    // Find most recent kill across all worlds
    let latestDate = null;
    let latestStr = 'Never';
    Object.values(boss.killsByWorld).forEach(entries => {
      entries.forEach(e => {
        const [d, m, y] = e.date.split('/').map(Number);
        const dt = new Date(y, m - 1, d);
        if (!latestDate || dt > latestDate) {
          latestDate = dt;
          latestStr = e.date;
        }
      });
    });
    console.log(`${bossName.padEnd(30)}${String(worldCount).padStart(3)}     ${latestStr}`);
  });
}

main().catch(console.error);
