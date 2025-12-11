'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-surface border-t border-border py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3 text-secondary">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    <span>Feito com</span>
                    <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
                    <span>por Even Worse, Lunarian</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary/60">
                    <p>
                        &copy; {new Date().getFullYear()} RubinOT Boss Tracker. All rights reserved.
                    </p>
                    <span>•</span>
                    <Link
                        href="/admin"
                        className="hover:text-purple-400 transition-colors"
                    >
                        Admin
                    </Link>
                </div>
            </div>
        </footer>
    );
}
