/**
 * Script to check inner/outer window predictions for all bosses across all worlds.
 * Queries Supabase directly — no dev server needed.
 * Run: npx tsx scripts/check-windows.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env.local loading (no dotenv dependency)
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
});

import { SpawnPredictor, KillRecord } from '../utils/spawnLogic';
import { BOSS_CATEGORIES } from '../utils/bossCategories';

const CREATURES = BOSS_CATEGORIES.Criaturas;

const PREDICTION_BLACKLIST = [
  'Frostbell', 'Frostreaper',
  'Bakragore', 'The Percht Queen', 'The World Devourer',
  'Undead Cavebear', 'Crustacea Gigantica', 'Oodok', 'Arthem',
  'Midnight Panther', 'Feroxa', 'Dreadful Disruptor'
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Fetching kill_history from Supabase...');

  // Paginate to get all records
  let allKills: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from('kill_history')
      .select('boss_name, world, date, count')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) { console.error(error); process.exit(1); }
    if (data && data.length > 0) {
      allKills = [...allKills, ...data];
      if (data.length < pageSize) hasMore = false;
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`Loaded ${allKills.length} kill records.\n`);

  // Build KillRecord array
  const kills: KillRecord[] = allKills
    .filter(k => !PREDICTION_BLACKLIST.includes(k.boss_name))
    .map(k => ({
      bossName: k.boss_name,
      world: k.world,
      killedAt: k.date
    }));

  const predictor = new SpawnPredictor(kills);

  // Group kills by boss+world to find latest kill per world
  const bossWorldMap = new Map<string, { bossName: string; world: string; dates: string[] }>();
  allKills.forEach(k => {
    if (PREDICTION_BLACKLIST.includes(k.boss_name)) return;
    if (CREATURES.includes(k.boss_name)) return;
    const key = `${k.boss_name}|${k.world}`;
    if (!bossWorldMap.has(key)) {
      bossWorldMap.set(key, { bossName: k.boss_name, world: k.world, dates: [] });
    }
    bossWorldMap.get(key)!.dates.push(k.date);
  });

  const fmt = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

  // Table header
  console.log(
    'Boss'.padEnd(25) +
    'World'.padEnd(12) +
    'Status'.padEnd(14) +
    'Outer'.padEnd(16) +
    'Inner'.padEnd(16) +
    'MinG'.padEnd(6) +
    'MaxG'.padEnd(6) +
    'TMin'.padEnd(6) +
    'TMax'.padEnd(6) +
    'P25'.padEnd(6) +
    'P75'
  );
  console.log('─'.repeat(120));

  let count = 0;
  const entries = Array.from(bossWorldMap.values()).sort((a, b) => a.bossName.localeCompare(b.bossName) || a.world.localeCompare(b.world));

  for (const entry of entries) {
    // Find latest kill
    const sorted = entry.dates.sort((a, b) => {
      const [d1, m1, y1] = a.split('/').map(Number);
      const [d2, m2, y2] = b.split('/').map(Number);
      return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
    });

    const lastKillDate = sorted[0];
    const pred = predictor.predict(entry.bossName, entry.world, lastKillDate);

    if (pred.status === 'UNKNOWN') continue;

    const outerStr = `${fmt(pred.nextMinSpawn)}-${fmt(pred.nextMaxSpawn)}`;
    const hasTight = pred.tightMinSpawn && pred.tightMaxSpawn && pred.stats?.tightMinGap !== pred.stats?.tightMaxGap;
    const innerStr = hasTight
      ? `${fmt(pred.tightMinSpawn!)}-${fmt(pred.tightMaxSpawn!)}`
      : '—';

    console.log(
      entry.bossName.padEnd(25) +
      entry.world.padEnd(12) +
      pred.status.padEnd(14) +
      outerStr.padEnd(16) +
      innerStr.padEnd(16) +
      String(pred.stats?.minGap ?? '?').padEnd(6) +
      String(pred.stats?.maxGap ?? '?').padEnd(6) +
      String(pred.stats?.tightMinGap ?? '—').padEnd(6) +
      String(pred.stats?.tightMaxGap ?? '—').padEnd(6) +
      String(pred.stats?.p25?.toFixed(1) ?? '—').padEnd(6) +
      String(pred.stats?.p75?.toFixed(1) ?? '—')
    );
    count++;
  }

  console.log(`\n✅ Total predictions: ${count}`);
}

main().catch(console.error);
