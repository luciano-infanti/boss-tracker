import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    const blob = await put('boss-tracker-data.json', JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'boss-tracker-data' });
    
    if (blobs.length === 0) {
      return NextResponse.json({ worlds: {}, combined: [] });
    }

    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ worlds: {}, combined: [] });
  }
}
