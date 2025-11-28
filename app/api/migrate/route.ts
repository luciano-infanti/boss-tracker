import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { supabase } from '@/utils/supabaseClient';
import { ParsedData } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🚀 Starting migration from Vercel Blob...');

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not found' }, { status: 500 });
        }

        // 1. Fetch data from Vercel Blob
        const { blobs } = await list({ token });

        // Find the main data file
        let dataBlob = blobs.find(b => b.pathname === 'boss-tracker-data.json');

        // If not found, try to find ANY json file that looks like a backup or data
        if (!dataBlob) {
            dataBlob = blobs.find(b => b.pathname.endsWith('.json') && b.size > 1000);
        }

        if (!dataBlob) {
            return NextResponse.json({ error: 'No data file found in Blob storage' }, { status: 404 });
        }

        console.log(`📂 Found blob: ${dataBlob.url}`);
        const response = await fetch(dataBlob.url);
        const json = await response.json();

        // Handle different structures: { data: ... } or raw data
        const data = (json.data || json) as ParsedData;

        if (!data || (!data.combined && !data.bosses)) {
            return NextResponse.json({ error: 'Invalid data format in blob' }, { status: 500 });
        }

        // 2. Insert Bosses
        if (data.combined) {
            console.log(`Processing ${data.combined.length} bosses...`);
            for (const boss of data.combined) {
                const { error: bossError } = await supabase
                    .from('bosses')
                    .upsert({
                        name: boss.name,
                        total_days_spawned: boss.totalSpawnDays,
                        total_kills: boss.totalKills,
                        spawn_frequency: boss.typicalSpawnFrequency,
                        stats: { perWorldStats: boss.perWorldStats }
                    }, { onConflict: 'name' });

                if (bossError) console.error(`Error upserting boss ${boss.name}:`, bossError);
            }
        }

        // 3. Insert Characters
        if (data.characters) {
            console.log(`Processing ${data.characters.length} characters...`);
            for (const char of data.characters) {
                const { error: charError } = await supabase
                    .from('characters')
                    .upsert({
                        name: char.name,
                        world: char.world,
                        vocation: char.vocation,
                        level: char.level,
                        link: char.link,
                        last_updated: char.last_updated,
                        stats: {}
                    }, { onConflict: 'name' });

                if (charError) {
                    console.error(`Error upserting character ${char.name}:`, charError);
                    continue;
                }

                if (char.history && char.history.length > 0) {
                    const historyRecords = char.history.map(h => ({
                        character_name: char.name,
                        date: h.date,
                        level: h.level,
                        experience: h.experience,
                        daily_raw: h.daily_raw,
                        stats: h.stats
                    }));

                    const { error: histError } = await supabase
                        .from('character_history')
                        .upsert(historyRecords, { onConflict: 'character_name, date' });

                    if (histError) console.error(`Error inserting history for ${char.name}:`, histError);
                }
            }
        }

        // 4. Insert Kill History
        if (data.killDates) {
            console.log(`Processing kill history...`);
            for (const record of data.killDates) {
                for (const [world, kills] of Object.entries(record.killsByWorld)) {
                    const killRecords = (kills as any[]).map(k => ({
                        boss_name: record.bossName,
                        world: world,
                        date: k.date,
                        count: k.count
                    }));

                    if (killRecords.length > 0) {
                        const { error: killError } = await supabase
                            .from('kill_history')
                            .upsert(killRecords, { onConflict: 'boss_name, world, date' });
                        if (killError) console.error(`Error inserting kills for ${record.bossName} in ${world}:`, killError);
                    }
                }
            }
        }

        // 5. Daily Update
        if (data.daily) {
            await supabase.from('metadata').upsert({
                key: 'daily_update',
                value: data.daily
            });
        }

        return NextResponse.json({ success: true, message: 'Migration from Blob completed successfully' });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
    }
}
