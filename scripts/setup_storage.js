const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fzovndomokzocesykxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3ZuZG9tb2t6b2Nlc3lreG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1NTQxNiwiZXhwIjoyMDc5ODMxNDE2fQ.57Hlt2CaLCZ1qVCnw8noHAJMAqg8AaA6DMOPrtJeHMI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('Checking for "backups" bucket...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    const backupBucket = buckets.find(b => b.name === 'backups');

    if (backupBucket) {
        console.log('✅ "backups" bucket already exists.');
    } else {
        console.log('Creating "backups" bucket...');
        const { data, error: createError } = await supabase.storage.createBucket('backups', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/json', 'text/plain']
        });

        if (createError) {
            console.error('❌ Error creating bucket:', createError);
        } else {
            console.log('✅ "backups" bucket created successfully.');
        }
    }
}

setupStorage();
