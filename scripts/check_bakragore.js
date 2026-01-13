const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fzovndomokzocesykxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3ZuZG9tb2t6b2Nlc3lreG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1NTQxNiwiZXhwIjoyMDc5ODMxNDE2fQ.57Hlt2CaLCZ1qVCnw8noHAJMAqg8AaA6DMOPrtJeHMI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBosses() {
    console.log('=== CHECKING BAKRAGORE & WORLD DEVOURER ===\n');

    // Check bosses table
    console.log('--- BOSSES TABLE ---');
    const { data: bosses, error: bossError } = await supabase
        .from('bosses')
        .select('name, total_kills, total_days_spawned, stats')
        .or('name.ilike.%Bakragore%,name.ilike.%World Devourer%');

    if (bossError) {
        console.error('Boss error:', bossError);
    } else {
        bosses.forEach(b => {
            console.log(`\n${b.name}:`);
            console.log(`  total_kills: ${b.total_kills}`);
            console.log(`  total_days_spawned: ${b.total_days_spawned}`);
            console.log(`  perWorldStats:`, JSON.stringify(b.stats?.perWorldStats || [], null, 4));
        });
    }

    // Check kill_history table
    console.log('\n--- KILL_HISTORY TABLE ---');
    const { data: kills, error: killError } = await supabase
        .from('kill_history')
        .select('boss_name, world, date, count')
        .or('boss_name.ilike.%Bakragore%,boss_name.ilike.%World Devourer%');

    if (killError) {
        console.error('Kill error:', killError);
    } else if (kills.length === 0) {
        console.log('No kill history records found for these bosses.');
    } else {
        console.log(`Found ${kills.length} kill records:`);
        kills.forEach(k => {
            console.log(`  ${k.boss_name} - ${k.world}: ${k.count} kills on ${k.date}`);
        });
    }
}

checkBosses();
