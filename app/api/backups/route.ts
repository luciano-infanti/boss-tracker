import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .storage
            .from('backups')
            .list('', {
                limit: 50,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) {
            console.error('GET /api/backups error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map Supabase response to match existing frontend interface
        // Supabase returns: { name, id, updated_at, created_at, last_accessed_at, metadata }
        // Frontend expects: { url, pathname, uploadedAt }

        const backups = await Promise.all(data.map(async (file) => {
            const { data: { publicUrl } } = supabase
                .storage
                .from('backups')
                .getPublicUrl(file.name);

            return {
                url: publicUrl,
                pathname: file.name,
                uploadedAt: file.created_at || file.updated_at
            };
        }));

        return NextResponse.json({ backups });
    } catch (error: any) {
        console.error('GET /api/backups error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
