process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgres://postgres.fzovndomokzocesykxmi:QuN86khZCUT75HwD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

const client = new Client({ connectionString, ssl: true });

async function verify() {
  try {
    await client.connect();

    // Load exported file
    const exportPath = path.join(__dirname, '..', 'supabase_export.json');
    const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

    console.log('=== VERIFICATION REPORT ===\n');

    // 1. Row counts
    const counts = {};
    for (const table of ['bosses', 'kill_history', 'characters', 'character_history', 'metadata']) {
      const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
      counts[table] = parseInt(res.rows[0].count);
    }

    console.log('📊 ROW COUNTS:');
    console.log('Table              | DB (live) | Export    | Match?');
    console.log('-------------------|-----------|-----------|-------');
    let allMatch = true;
    for (const [table, dbCount] of Object.entries(counts)) {
      const exportCount = exported.tables[table]?.count || 0;
      const match = dbCount === exportCount;
      if (!match) allMatch = false;
      console.log(`${table.padEnd(19)}| ${String(dbCount).padEnd(10)}| ${String(exportCount).padEnd(10)}| ${match ? '✅' : '❌'}`);
    }

    // 2. Sample bosses - check a few specific ones
    console.log('\n📋 BOSS SPOT CHECK:');
    const sampleBosses = ['Orshabaal', 'Ferumbras', 'Yeti', 'Morgaroth', 'Midnight Panther'];
    for (const bossName of sampleBosses) {
      const dbRes = await client.query('SELECT name, total_kills, total_days_spawned FROM bosses WHERE name = $1', [bossName]);
      const exportBoss = exported.tables.bosses.data.find(b => b.name === bossName);

      if (dbRes.rows[0] && exportBoss) {
        const dbKills = dbRes.rows[0].total_kills;
        const exKills = exportBoss.total_kills;
        const dbDays = dbRes.rows[0].total_days_spawned;
        const exDays = exportBoss.total_days_spawned;
        const match = dbKills === exKills && dbDays === exDays;
        console.log(`  ${bossName.padEnd(20)} kills: DB=${dbKills} export=${exKills} | days: DB=${dbDays} export=${exDays} ${match ? '✅' : '❌'}`);
      } else {
        console.log(`  ${bossName.padEnd(20)} ${!dbRes.rows[0] ? '❌ NOT IN DB' : '❌ NOT IN EXPORT'}`);
      }
    }

    // 3. Kill history - check totals per world
    console.log('\n🌍 KILL HISTORY BY WORLD:');
    const worldCounts = await client.query(`
      SELECT world, COUNT(*) as records, SUM(count) as total_kills 
      FROM kill_history 
      GROUP BY world 
      ORDER BY world
    `);

    for (const row of worldCounts.rows) {
      const exportWorldRecords = exported.tables.kill_history.data.filter(k => k.world === row.world);
      const exportTotal = exportWorldRecords.reduce((sum, k) => sum + k.count, 0);
      const recordMatch = exportWorldRecords.length === parseInt(row.records);
      const killMatch = exportTotal === parseInt(row.total_kills);
      console.log(`  ${row.world.padEnd(16)} records: DB=${row.records} export=${exportWorldRecords.length} ${recordMatch ? '✅' : '❌'} | kills: DB=${row.total_kills} export=${exportTotal} ${killMatch ? '✅' : '❌'}`);
    }

    // 4. Date range check
    console.log('\n📅 DATE RANGE:');
    const dateRange = await client.query(`
      SELECT MIN(date) as earliest, MAX(date) as latest 
      FROM kill_history
    `);
    const exportDates = exported.tables.kill_history.data.map(k => k.date).sort();
    console.log(`  DB:     ${dateRange.rows[0].earliest} → ${dateRange.rows[0].latest}`);
    console.log(`  Export: ${exportDates[0]} → ${exportDates[exportDates.length - 1]}`);

    // 5. Final verdict
    console.log('\n' + '='.repeat(40));
    console.log(allMatch ? '✅ ALL ROW COUNTS MATCH — Export looks correct!' : '❌ MISMATCH DETECTED — Check details above');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

verify();
