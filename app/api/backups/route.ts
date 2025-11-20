import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'Token not configured' }, { status: 500 });
        }

        const { blobs } = await list({
            prefix: 'backups/',
            token: token,
            limit: 50, // Limit to last 50 backups
        });

        // Sort by uploadedAt descending
        const sortedBlobs = blobs.sort((a, b) => {
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });

        return NextResponse.json({ backups: sortedBlobs });
    } catch (error: any) {
        console.error('GET /api/backups error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
