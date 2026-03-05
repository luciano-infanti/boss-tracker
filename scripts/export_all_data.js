process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgres://postgres.fzovndomokzocesykxmi:QuN86khZCUT75HwD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

const client = new Client({
  connectionString,
  ssl: true
});

async function exportAll() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 1. Bosses
    console.log('📦 Exporting bosses...');
    const bosses = await client.query('SELECT * FROM bosses ORDER BY name');
    console.log(`   → ${bosses.rows.length} bosses`);

    // 2. Kill History
    console.log('📦 Exporting kill_history...');
    const killHistory = await client.query('SELECT * FROM kill_history ORDER BY boss_name, world, date');
    console.log(`   → ${killHistory.rows.length} kill records`);

    // 3. Characters
    console.log('📦 Exporting characters...');
    const characters = await client.query('SELECT * FROM characters ORDER BY name');
    console.log(`   → ${characters.rows.length} characters`);

    // 4. Character History
    console.log('📦 Exporting character_history...');
    const charHistory = await client.query('SELECT * FROM character_history ORDER BY character_name, date');
    console.log(`   → ${charHistory.rows.length} character history records`);

    // 5. Metadata
    console.log('📦 Exporting metadata...');
    const metadata = await client.query('SELECT * FROM metadata');
    console.log(`   → ${metadata.rows.length} metadata entries`);

    const exportData = {
      exported_at: new Date().toISOString(),
      tables: {
        bosses: {
          count: bosses.rows.length,
          data: bosses.rows
        },
        kill_history: {
          count: killHistory.rows.length,
          data: killHistory.rows
        },
        characters: {
          count: characters.rows.length,
          data: characters.rows
        },
        character_history: {
          count: charHistory.rows.length,
          data: charHistory.rows
        },
        metadata: {
          count: metadata.rows.length,
          data: metadata.rows
        }
      }
    };

    const outPath = path.join(__dirname, '..', 'supabase_export.json');
    fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2));
    console.log(`\n✅ Exported to: ${outPath}`);
    console.log(`   Total size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

exportAll();
