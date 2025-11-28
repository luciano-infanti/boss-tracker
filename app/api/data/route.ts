import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { ParsedData, CombinedBoss, Character, BossKillHistory, Boss } from '@/types';

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

    // 4. Fetch Kill History
    const { data: killHistoryData, error: killHistError } = await supabase
      .from('kill_history')
      .select('*');

    if (killHistError) throw killHistError;

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

          const worldKills = killDatesMap.get(cb.name)?.killsByWorld[stat.world] || [];
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
            history: worldKills.map(k => `${k.date} (${k.count}x)`).join(', ')
          });
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
      for (const record of data.killDates) {
        for (const [world, kills] of Object.entries(record.killsByWorld)) {
          const killRecords = kills.map(k => ({
            boss_name: record.bossName,
            world: world,
            date: k.date,
            count: k.count
          }));
          if (killRecords.length > 0) {
            const { error } = await supabase
              .from('kill_history')
              .upsert(killRecords, { onConflict: 'boss_name, world, date' });
            if (error) console.error('Error upserting kills:', error);
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('POST /api/data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
