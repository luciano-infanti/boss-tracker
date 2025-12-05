const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fzovndomokzocesykxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3ZuZG9tb2t6b2Nlc3lreG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1NTQxNiwiZXhwIjoyMDc5ODMxNDE2fQ.57Hlt2CaLCZ1qVCnw8noHAJMAqg8AaA6DMOPrtJeHMI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyPolicies() {
    console.log('Applying RLS policies for "backups" bucket...');

    // Note: Supabase JS client doesn't support creating policies directly via storage API easily.
    // We usually need to run SQL. However, we can try to update the bucket to be public if it isn't.
    // But for granular RLS (like allowing anon uploads), we really need SQL.
    // Since I cannot run SQL directly from here without a postgres connection or SQL API (which Supabase JS doesn't expose for DDL),
    // I will try to use the `rpc` method if there's a helper, or just rely on the bucket being "public".

    // Wait, I created the bucket as public: true.
    // "public: true" means "The bucket is publicly accessible." which usually implies GET is allowed.
    // But LIST and UPLOAD might still be restricted by RLS if enabled globally on storage.objects.

    // Let's try to upload a test file with the ANON key to verify if it fails.

    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3ZuZG9tb2t6b2Nlc3lreG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTU0MTYsImV4cCI6MjA3OTgzMTQxNn0.MLzT00Q-XPEaJqk1yjt34VIaK_AOVGaK8v8KRQO7kHo";
    const anonClient = createClient(supabaseUrl, anonKey);

    console.log('Testing upload with ANON key...');
    const { data, error } = await anonClient
        .storage
        .from('backups')
        .upload('test-policy.txt', 'This is a test file', { upsert: true });

    if (error) {
        console.error('❌ Anon upload failed:', error);
        console.log('⚠️ This confirms RLS policies are blocking access.');
        console.log('💡 You need to run SQL to enable access.');
    } else {
        console.log('✅ Anon upload successful!');
    }

    console.log('Testing list with ANON key...');
    const { data: listData, error: listError } = await anonClient
        .storage
        .from('backups')
        .list();

    if (listError) {
        console.error('❌ Anon list failed:', listError);
    } else {
        console.log(`✅ Anon list successful! Found ${listData.length} files.`);
    }
}

applyPolicies();
