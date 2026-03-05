import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
envFile.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const i = t.indexOf('=');
  if (i === -1) return;
  if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1);
});

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Get all Ferumbras Mortal Shell kills
  const { data, error } = await sb
    .from('kill_history')
    .select('date, world, count')
    .eq('boss_name', 'Ferumbras Mortal Shell')
    .order('date');

  if (error) { console.error(error); process.exit(1); }

  // Filter for January (any year)
  const janKills = data?.filter(r => {
    const [, month] = r.date.split('/');
    return month === '01';
  }) || [];

  let total = 0;
  janKills.forEach(r => {
    total += r.count;
    console.log(`${r.date.padEnd(14)}${r.world.padEnd(16)}x${r.count}`);
  });

  console.log(`\n── Total Ferumbras Mortal Shell kills in January: ${total} (${janKills.length} entries)`);
}

main().catch(console.error);
