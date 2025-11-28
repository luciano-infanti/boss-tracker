const { createClient } = require('@supabase/supabase-js');

// Load env vars manually since we are running with node
const supabaseUrl = "https://fzovndomokzocesykxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3ZuZG9tb2t6b2Nlc3lreG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1NTQxNiwiZXhwIjoyMDc5ODMxNDE2fQ.57Hlt2CaLCZ1qVCnw8noHAJMAqg8AaA6DMOPrtJeHMI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBosses() {
    console.log('Checking bosses...');

    const { data, error } = await supabase
        .from('bosses')
        .select('name, total_kills')
        .eq('total_kills', 0);

    if (error) {
        console.error('Error fetching bosses:', error);
        return;
    }

    console.log(`Found ${data.length} bosses with 0 kills:`);
    data.forEach(b => console.log(`- ${b.name} (Kills: ${b.total_kills})`));

    // Also check total count
    const { count } = await supabase.from('bosses').select('*', { count: 'exact', head: true });
    console.log(`Total bosses in DB: ${count}`);
}

checkBosses();
