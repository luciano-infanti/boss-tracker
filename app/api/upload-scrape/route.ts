import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.SCRAPER_SECRET;
    
    // Check Authorization
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body || !Array.isArray(body.rowsToUpsert)) {
      return NextResponse.json({ error: 'Invalid payload format. Expected { rowsToUpsert: [] }' }, { status: 400 });
    }

    const { rowsToUpsert, scraperName = "Anonymous" } = body;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

    if (rowsToUpsert.length === 0) {
      await supabase.from('scraper_logs').insert({
        scraper_name: scraperName,
        records_upserted: 0,
        status: 'SUCCESS_NO_RECORDS',
        ip_address: ipAddress,
        log_message: 'Scraper successfully ran but found no boss kills.'
      });
      return NextResponse.json({ message: 'No rows to upsert.' }, { status: 200 });
    }

    // Determine the unique effective dates + past 2 days to form a 3-day rolling window
    const baseDate = new Date();
    const strToday = rowsToUpsert[0]?.date || ''; // Assuming the scraper correctly sends the effective date
    
    // In case we want to be foolproof, calculate the 3 strings manually from current time:
    const getStr = (d: Date) => {
       const day = String(d.getDate()).padStart(2, '0');
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const year = d.getFullYear();
       return `${day}/${month}/${year}`;
    };
    
    const dToday = new Date(baseDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const dYest = new Date(dToday.getTime() - 24 * 60 * 60 * 1000);
    const dDayBefore = new Date(dToday.getTime() - 48 * 60 * 60 * 1000);
    
    const recentDays = [getStr(dToday), getStr(dYest), getStr(dDayBefore)];

    const finalRowsToUpsert: any[] = [];

    let recentKillsData: any[] = [];
    if (recentDays.length > 0) {
      const { data: rKills } = await supabase
        .from('kill_history')
        .select('*')
        .in('date', recentDays);
      recentKillsData = rKills || [];
    }

    // Process and diff rows
    for (const row of rowsToUpsert) {
      // Sum the kills for this boss in this world over the last 3 days
      const bossRecentRecords = recentKillsData.filter(
        (y) => y.boss_name === row.boss_name && y.world === row.world
      );

      const recentSum = bossRecentRecords.reduce((sum, record) => sum + record.count, 0);

      if (row.count > recentSum) {
        // If the 24h count is higher than the summation of the last 3 DB days, new kills occurred!
        // We record ONLY the mathematical difference as today's kills
        finalRowsToUpsert.push({
          boss_name: row.boss_name,
          world: row.world,
          date: row.date || getStr(dToday), // fallback
          count: row.count - recentSum // strictly the new kills
        });
      }
      // If row.count <= recentSum, no *new* kills happened in the overlapping window, so we omit this row.
    }

    if (finalRowsToUpsert.length === 0) {
      await supabase.from('scraper_logs').insert({
        scraper_name: scraperName,
        records_upserted: 0,
        status: 'SUCCESS_DUPLICATES_IGNORED',
        ip_address: ipAddress,
        log_message: `Scraper found ${rowsToUpsert.length} kills, but all were overlapped duplicates from yesterday.`
      });
      return NextResponse.json({ message: 'All found kills were overlapping duplicates.' }, { status: 200 });
    }

    // Upsert validated final data to Supabase
    const { data, error } = await supabase
      .from('kill_history')
      .upsert(finalRowsToUpsert, { onConflict: 'boss_name,world,date' });

    if (error) {
      console.error('[API] Supabase Upsert Error:', error);
      
      await supabase.from('scraper_logs').insert({
        scraper_name: scraperName,
        records_upserted: rowsToUpsert.length,
        status: 'db_insert_error',
        ip_address: ipAddress,
        log_message: error.message
      });

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from('scraper_logs').insert({
      scraper_name: scraperName,
      records_upserted: rowsToUpsert.length,
      status: 'success',
      ip_address: ipAddress,
      log_message: `Successfully upserted ${rowsToUpsert.length} records.`
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upserted ${rowsToUpsert.length} records.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API] Server Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
