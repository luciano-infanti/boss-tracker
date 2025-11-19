import { del, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 500 });
    }

    const { blobs } = await list({ 
      prefix: 'boss-tracker-data',
      token: token,
    });
    
    for (const blob of blobs) {
      await del(blob.url, { token });
    }

    return NextResponse.json({ success: true, deleted: blobs.length });
  } catch (error: any) {
    console.error('Clear error:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
