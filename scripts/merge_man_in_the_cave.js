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

        const lowerCaseName = 'Man in the Cave';
        const titleCaseName = 'Man In The Cave';

        // 1. Update kill_history
        // Handle potential unique constraint violations on (boss_name, world, date)
        // If we update and it conflicts, it means there are duplicate entries for the same day/world with different casing.
        // In that case, we should sum the counts and delete the duplicate.

        // First, let's identify conflicts
        const conflictsQuery = `
      SELECT t1.id as source_id, t2.id as target_id, t1.count as source_count, t2.count as target_count
      FROM kill_history t1
      JOIN kill_history t2 ON t1.world = t2.world AND t1.date = t2.date
      WHERE t1.boss_name = $1 AND t2.boss_name = $2
    `;
        const conflicts = await client.query(conflictsQuery, [lowerCaseName, titleCaseName]);

        for (const conflict of conflicts.rows) {
            console.log(`Resolving conflict for ID ${conflict.source_id} -> ${conflict.target_id}`);
            // Add source count to target
            await client.query('UPDATE kill_history SET count = count + $1 WHERE id = $2', [conflict.source_count, conflict.target_id]);
            // Delete source
            await client.query('DELETE FROM kill_history WHERE id = $1', [conflict.source_id]);
        }

        // Now safe to update remaining records
        const updateResult = await client.query('UPDATE kill_history SET boss_name = $1 WHERE boss_name = $2', [titleCaseName, lowerCaseName]);
        console.log(`Updated ${updateResult.rowCount} rows in kill_history.`);


        // 2. Update bosses table
        const lowerBoss = await client.query('SELECT * FROM bosses WHERE name = $1', [lowerCaseName]);
        const titleBoss = await client.query('SELECT * FROM bosses WHERE name = $1', [titleCaseName]);

        if (lowerBoss.rows.length > 0 && titleBoss.rows.length > 0) {
            // Both exist, merge into titleBoss
            const lw = lowerBoss.rows[0];
            const tb = titleBoss.rows[0];

            console.log(`Merging '${lowerCaseName}' (${lw.total_kills} kills) into '${titleCaseName}' (${tb.total_kills} kills)`);

            // Sum stats
            const newKills = (tb.total_kills || 0) + (lw.total_kills || 0);
            const newDays = (tb.total_days_spawned || 0) + (lw.total_days_spawned || 0);

            // Update titleBoss
            await client.query('UPDATE bosses SET total_kills = $1, total_days_spawned = $2 WHERE id = $3', [newKills, newDays, tb.id]);

            // Delete lowerBoss
            await client.query('DELETE FROM bosses WHERE id = $1', [lw.id]);
            console.log(`Merged and deleted '${lowerCaseName}'`);

        } else if (lowerBoss.rows.length > 0) {
            // Only lower exists, rename it
            await client.query('UPDATE bosses SET name = $1 WHERE id = $2', [titleCaseName, lowerBoss.rows[0].id]);
            console.log(`Renamed '${lowerCaseName}' to '${titleCaseName}'`);
        } else {
            console.log('No lower case boss entry found in bosses table.');
        }

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await client.end();
    }
}

main();
