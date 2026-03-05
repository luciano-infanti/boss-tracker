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

    // Upsert data to Supabase
    const { data, error } = await supabase
      .from('kill_history')
      .upsert(rowsToUpsert, { onConflict: 'boss_name,world,date' });

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
