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

        // Check kill_history
        const res = await client.query('SELECT boss_name, SUM(count) as total_kills FROM kill_history GROUP BY boss_name ORDER BY total_kills DESC LIMIT 20');
        console.log('Top 20 bosses by kill_history aggregation:');
        res.rows.forEach(r => console.log(`${r.boss_name}: ${r.total_kills}`));

        // Compare with bosses table
        const resBosses = await client.query('SELECT name, total_kills FROM bosses ORDER BY total_kills DESC LIMIT 20');
        console.log('\nTop 20 bosses from bosses table:');
        resBosses.rows.forEach(r => console.log(`${r.name}: ${r.total_kills}`));


    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
