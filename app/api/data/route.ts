// import { put } from '@vercel/blob'; // Removed in favor of Supabase Storage
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ParsedData, CombinedBoss, Character, BossKillHistory, Boss } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('GET /api/data - Fetching data from Supabase');

    // 1. Fetch Bosses
    const { data: bossesData, error: bossesError } = await supabase
      .from('bosses')
      .select('*');

    if (bossesError) throw bossesError;

    // 2. Fetch Characters
    const { data: charactersData, error: charsError } = await supabase
      .from('characters')
      .select('*');

    if (charsError) throw charsError;

    // 3. Fetch Character History
    const { data: charHistoryData, error: charHistError } = await supabase
      .from('character_history')
      .select('*');

    if (charHistError) throw charHistError;

    // 4. Fetch Kill History (Paginated to bypass limits)
    let allKillHistory: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('kill_history')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (batchError) throw batchError;

      if (batch && batch.length > 0) {
        allKillHistory = [...allKillHistory, ...batch];
        if (batch.length < pageSize) hasMore = false;
        page++;
      } else {
        hasMore = false;
      }
    }

    const killHistoryData = allKillHistory;

    // --- Reconstruct Data Structure ---

    // --- Reconstruct Data Structure ---

    // Reconstruct Characters
    const characters: Character[] = (charactersData || []).map((char: any) => {
      const history = (charHistoryData || [])
        .filter((h: any) => h.character_name === char.name)
        .map((h: any) => ({
          date: h.date,
          level: h.level,
          experience: h.experience,
          daily_raw: h.daily_raw,
          stats: h.stats
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        name: char.name,
        world: char.world,
        vocation: char.vocation,
        level: char.level,
        link: char.link,
        last_updated: char.last_updated,
        history
      };
    });

    // Reconstruct Combined Bosses
    const combined: CombinedBoss[] = (bossesData || []).map((boss: any) => ({
      name: boss.name,
      totalSpawnDays: boss.total_days_spawned,
      totalKills: boss.total_kills,
      appearsInWorlds: boss.stats?.perWorldStats?.length || 0,
      typicalSpawnFrequency: boss.spawn_frequency,
      perWorldStats: boss.stats?.perWorldStats || []
    }));

    // Reconstruct Kill Dates (BossKillHistory)
    // Group kill_history by boss
    const killDatesMap = new Map<string, BossKillHistory>();

    (killHistoryData || []).forEach((kill: any) => {
      // Normalize boss name key (e.g. "Yeti" vs "yeti")
      // We'll use the name from the kill record, but when looking up, we'll scan values or use a normalized map.
      // Better: Use the name from the kill record as the display name, but be consistent.

      if (!killDatesMap.has(kill.boss_name)) {
        killDatesMap.set(kill.boss_name, {
          bossName: kill.boss_name,
          totalSpawnDays: 0, // Calculated from aggregation if needed, or fetched from boss
          totalKills: 0,
          killsByWorld: {},
          chronologicalHistory: []
        });
      }
      const entry = killDatesMap.get(kill.boss_name)!;

      if (!entry.killsByWorld[kill.world]) {
        entry.killsByWorld[kill.world] = [];
      }

      entry.killsByWorld[kill.world].push({
        date: kill.date,
        world: kill.world,
        count: kill.count
      });

      entry.chronologicalHistory.push({
        date: kill.date,
        world: kill.world,
        count: kill.count
      });
    });

    const killDates = Array.from(killDatesMap.values());

    // DEBUG: Check if Yeti is in killDatesMap
    const yetiInMap = killDates.find(k => k.bossName?.toLowerCase() === 'yeti');
    if (yetiInMap) {
      console.log('🔍 [API] Yeti in killDatesMap:', JSON.stringify(yetiInMap, null, 2));
    } else {
      console.log('⚠️ [API] Yeti NOT in killDatesMap');
    }

    // Reconstruct Worlds (Record<string, Boss[]>)
    // This is derived from perWorldStats or kill history.
    // Ideally, we iterate combined bosses and split them into worlds.
    const worlds: Record<string, Boss[]> = {};

    combined.forEach(cb => {
      if (cb.perWorldStats) {
        cb.perWorldStats.forEach(stat => {
          if (!worlds[stat.world]) worlds[stat.world] = [];

          // Find next spawn and last kill for this specific world if possible
          // For now, we use the combined data or generic defaults
          // To be accurate, we should look at kill_history for this world

          // Case-insensitive lookup for kill history
          const bossNameLower = cb.name.toLowerCase();
          const historyEntry = Array.from(killDatesMap.values()).find(k => k.bossName.toLowerCase() === bossNameLower);
          const worldKills = historyEntry?.killsByWorld[stat.world] || [];
          // Sort by date desc
          worldKills.sort((a, b) => { // Parse DD/MM/YYYY
            const [d1, m1, y1] = a.date.split('/').map(Number);
            const [d2, m2, y2] = b.date.split('/').map(Number);
            return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
          });
          const lastKill = worldKills[0]?.date || 'Never';

          worlds[stat.world].push({
            name: cb.name,
            totalDaysSpawned: stat.spawns, // Approximation
            totalKills: stat.kills,
            spawnFrequency: stat.frequency,
            nextExpectedSpawn: 'N/A', // Logic for next spawn per world is complex, usually global
            lastKillDate: lastKill,
            history: worldKills.map(k => k.count === 1 ? k.date : `${k.date} (${k.count}x)`).join(', ')
          });

          // DEBUG: Log Yeti specifically
          if (cb.name?.toLowerCase() === 'yeti') {
            console.log(`🔍 [API] Constructing Yeti for world ${stat.world}:`, {
              historyEntry: historyEntry ? 'FOUND' : 'NOT FOUND',
              worldKills: worldKills.length,
              worldKillsData: worldKills,
              historyString: worldKills.map(k => k.count === 1 ? k.date : `${k.date} (${k.count}x)`).join(', ')
            });
          }
        });
      }
    });

    // 5. Fetch Metadata (Daily Update)
    const { data: metaData, error: metaError } = await supabase
      .from('metadata')
      .select('value')
      .eq('key', 'daily_update')
      .single();

    // If error is not "row not found", throw it. But single() returns error if 0 rows.
    // So we ignore error if it's just missing data.

    const daily = metaData?.value || undefined;

    const parsedData: ParsedData = {
      worlds,
      combined,
      characters,
      killDates,
      daily
    };

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('GET /api/data error:', error);
    return NextResponse.json({ worlds: {}, combined: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/data - Saving to Supabase');
    const body = await request.json();
    const data = body.data as ParsedData;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // 0. Save Daily Update to Metadata
    if (data.daily) {
      const { error } = await supabase.from('metadata').upsert({
        key: 'daily_update',
        value: data.daily
      });
      if (error) console.error('Error saving daily update:', error);
    }

    // 1. Upsert Bosses
    if (data.combined) {
      for (const boss of data.combined) {
        const { error } = await supabase.from('bosses').upsert({
          name: boss.name,
          total_days_spawned: boss.totalSpawnDays,
          total_kills: boss.totalKills,
          spawn_frequency: boss.typicalSpawnFrequency,
          stats: { perWorldStats: boss.perWorldStats }
        }, { onConflict: 'name' });
        if (error) console.error('Error upserting boss:', error);
      }
    }

    // 2. Upsert Characters
    if (data.characters) {
      for (const char of data.characters) {
        const { error } = await supabase.from('characters').upsert({
          name: char.name,
          world: char.world,
          vocation: char.vocation,
          level: char.level,
          link: char.link,
          last_updated: char.last_updated,
          stats: {}
        }, { onConflict: 'name' });

        if (!error && char.history) {
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
          if (histError) console.error('Error upserting history:', histError);
        }
      }
    }

    // 3. Upsert Kill History
    if (data.killDates) {
      console.log(`📝 Upserting kill history for ${data.killDates.length} bosses...`);
      for (const record of data.killDates) {
        for (const [world, kills] of Object.entries(record.killsByWorld)) {
          const killRecords = kills.map(k => ({
            boss_name: record.bossName,
            world: world,
            date: k.date,
            count: k.count
          }));
          if (killRecords.length > 0) {
            // Debug log for Yeti
            if (record.bossName === 'Yeti') {
              console.log(`🔍 [UPSERT] Yeti kill records for ${world}:`, killRecords);
            }

            const { error } = await supabase
              .from('kill_history')
              .upsert(killRecords, { onConflict: 'boss_name, world, date' });

            if (error) {
              console.error(`❌ ERROR upserting kills for ${record.bossName} in ${world}:`, error);
            } else if (record.bossName === 'Yeti') {
              console.log(`✅ Successfully upserted ${killRecords.length} Yeti records for ${world}`);

              // VERIFY: Immediately query back to confirm it saved
              const { data: verifyData, error: verifyError } = await supabase
                .from('kill_history')
                .select('*')
                .eq('boss_name', 'Yeti')
                .eq('world', world);

              if (verifyError) {
                console.error(`❌ VERIFY ERROR for Yeti in ${world}:`, verifyError);
              } else {
                console.log(`🔍 VERIFY: Found ${verifyData?.length || 0} Yeti records in ${world} after upsert`);
              }
            }
          }
        }
      }
      console.log('✅ Kill history upsert complete');
    }

    // 4. Create Backup (Supabase Storage)
    try {
      console.log('Creating backup in Supabase Storage...');
      let dateStr = new Date().toISOString().split('T')[0]; // Default to today YYYY-MM-DD

      if (data.daily?.date) {
        dateStr = data.daily.date.replace(/\//g, '-');
      }

      const filename = `backup-${dateStr}.json`; // No folder prefix needed for bucket root, or use 'backups/' if preferred structure

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('backups')
        .upload(filename, JSON.stringify(data), {
          contentType: 'application/json',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error creating backup:', uploadError);
      } else {
        console.log(`✅ Backup created: ${filename}`);
      }
    } catch (backupError) {
      console.error('❌ Error creating backup:', backupError);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('POST /api/data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
