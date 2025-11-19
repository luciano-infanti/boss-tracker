import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('POST /api/data - Starting upload');

    const body = await request.json();
    console.log('Request body received keys:', Object.keys(body));

    if (!body.data) {
      console.error('No data in request body');
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN not found in environment');
      return NextResponse.json({
        error: 'Server configuration error: BLOB_READ_WRITE_TOKEN is missing. Please check your .env.local file.'
      }, { status: 500 });
    }

    console.log('Token found (length: ' + token.length + '), uploading to blob...');

    try {
      const blob = await put('boss-tracker-data.json', JSON.stringify(body.data), {
        access: 'public',
        addRandomSuffix: false,
        token: token,
      });

      console.log('Upload successful:', blob.url);
      return NextResponse.json({ success: true, url: blob.url });
    } catch (blobError: any) {
      console.error('Vercel Blob put error:', blobError);
      return NextResponse.json({
        error: `Blob upload failed: ${blobError.message}`,
        details: blobError.stack
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('POST /api/data error:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to upload data',
      details: error?.stack
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('GET /api/data - Fetching data');

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.log('No token, returning empty data');
      return NextResponse.json({ worlds: {}, combined: [] });
    }

    const { blobs } = await list({
      prefix: 'boss-tracker-data',
      token: token,
    });

    console.log('Found blobs:', blobs.length);

    if (blobs.length === 0) {
      console.log('No blobs found, returning empty data');
      return NextResponse.json({ worlds: {}, combined: [] });
    }

    console.log('Fetching blob from:', blobs[0].url);
    const response = await fetch(blobs[0].url);
    const data = await response.json();

    console.log('Data fetched successfully');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('GET /api/data error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ worlds: {}, combined: [] });
  }
}
