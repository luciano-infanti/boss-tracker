import "dotenv/config";
import { TRACKED_BOSSES, WORLDS, WORLD_ID_TO_SUPABASE_NAME } from "./constants";
import { launchSession, establishSession, fetchApiData } from "./browser";

const apiUrl = process.env.API_URL || "http://localhost:3000/api/upload-scrape";
const apiSecret = process.env.SCRAPER_SECRET;
const scraperName = process.env.SCRAPER_NAME || "Anonymous Scraper";

const BOSS_SET = new Set<string>(TRACKED_BOSSES);

function getEffectiveKillDate(): string {
  // Use current local time (BRT) without SS offset since we are scraping the last 24h
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  
  const parts = formatter.formatToParts(now);
  const day = parts.find(p => p.type === "day")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const year = parts.find(p => p.type === "year")?.value;
  
  return `${day}/${month}/${year}`;
}

export async function scrapeAllWorlds(onLog: (msg: string, isError?: boolean) => void) {
  if (!apiSecret) {
    onLog("Missing SCRAPER_SECRET in .env", true);
    throw new Error("Missing SCRAPER_SECRET");
  }

  const effectiveDate = getEffectiveKillDate();
  onLog(`Starting distributed scrape for Tibia Day: ${effectiveDate}`);

  const { browser, page } = await launchSession();
  
  const allRowsToUpsert = [];

  try {
    onLog("Establishing secure session on rubinot.com.br...");
    await establishSession(page);

    for (const world of WORLDS) {
      try {
        const scrapeUrl = `https://rubinot.com.br/api/killstats?world=${world.id}`;
        const data = (await fetchApiData(page, scrapeUrl)) as {
          entries: { race_name: string; creatures_killed_24h: number }[];
        };

        if (!data.entries || !Array.isArray(data.entries)) {
          onLog(`[ERR] ${world.name}: unexpected API response body`, true);
          continue;
        }

        const killed = data.entries.filter((e) => BOSS_SET.has(e.race_name) && e.creatures_killed_24h > 0);

        if (killed.length > 0) {
          const supabaseWorldName = WORLD_ID_TO_SUPABASE_NAME[world.id] || world.name;
          const rows = killed.map((boss) => ({
            boss_name: boss.race_name,
            world: supabaseWorldName,
            date: effectiveDate,
            count: boss.creatures_killed_24h
          }));
          
          allRowsToUpsert.push(...rows);
          onLog(`[OK] ${world.name} — ${rows.length} bosses killed today`);
        } else {
           onLog(`[OK] ${world.name} — 0 bosses killed today`);
        }
      } catch (error: any) {
        onLog(`[ERR] ${world.name}: ${error.message}`, true);
      }
    }

    if (allRowsToUpsert.length > 0) {
       onLog(`Sending ${allRowsToUpsert.length} records to Middleman API...`);
       
       const res = await fetch(apiUrl, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${apiSecret}`
         },
         body: JSON.stringify({ scraperName, rowsToUpsert: allRowsToUpsert })
       });
       
       if (!res.ok) {
         const errText = await res.text();
         onLog(`[ERR] API Request Failed: ${res.status} ${errText}`, true);
       } else {
         const json = await res.json();
         onLog(`[SUCCESS] Middleman API responded safely.`);
       }
    } else {
      onLog("No boss kills found across any tracked worlds.");
    }
    
    return allRowsToUpsert;
  } finally {
    await browser.close();
  }
}
