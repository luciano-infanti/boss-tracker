const { Client } = require('pg');

const connectionString = "postgres://postgres.fzovndomokzocesykxmi:QuN86khZCUT75HwD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

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

        console.log('--- Bosses Table ---');
        const resBosses = await client.query("SELECT * FROM bosses WHERE name ILIKE 'man in the cave'");
        console.log(resBosses.rows);

        console.log('\n--- Kill History Table (Sample) ---');
        const resHistory = await client.query("SELECT * FROM kill_history WHERE boss_name ILIKE 'man in the cave' LIMIT 10");
        console.log(resHistory.rows);

        console.log('\n--- Kill History Counts ---');
        const resHistoryCounts = await client.query("SELECT boss_name, COUNT(*) as entries, SUM(count) as total_kills FROM kill_history WHERE boss_name ILIKE 'man in the cave' GROUP BY boss_name");
        console.log(resHistoryCounts.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
