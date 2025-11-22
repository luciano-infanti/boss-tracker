'use server';

import { cookies } from 'next/headers';

export async function verifyBackupPassword(password: string) {
    if (password === process.env.BACKUP_PASSWORD) {
        (await cookies()).set('backup_auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        return { success: true };
    }
    return { success: false, error: 'Incorrect password' };
}

export async function checkAuth() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('backup_auth');
    return authCookie?.value === 'true';
}
