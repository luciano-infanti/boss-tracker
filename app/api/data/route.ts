import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ error: 'Missing token' }, { status: 500 });
    }
    
    const blob = await put('boss-tracker-data.json', JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Upload error:', error?.message || error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to upload data' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ worlds: {}, combined: [] });
    }

    const { blobs } = await list({ 
      prefix: 'boss-tracker-data',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    if (blobs.length === 0) {
      return NextResponse.json({ worlds: {}, combined: [] });
    }

    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fetch error:', error?.message || error);
    return NextResponse.json({ worlds: {}, combined: [] });
  }
}
