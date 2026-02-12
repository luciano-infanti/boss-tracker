'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    const toggleSidebar = () => {
        window.dispatchEvent(new Event('toggle-sidebar'));
    };

    return (
        <header className="md:hidden bg-surface border-b border-border sticky top-0 z-50">
            <div className="max-w-full mx-auto px-4 h-14 flex items-center">
                {/* Mobile hamburger */}
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 text-secondary hover:text-white transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} />
                </button>

                {/* Minimal branding for mobile */}
                <div className="flex items-center gap-2 ml-2">
                    <img
                        src="/rubinot-logo.png"
                        alt="RubinOT"
                        className="h-7 w-auto rounded-full"
                    />
                    <span className="text-sm font-semibold text-white/80">Boss Tracker</span>
                </div>
            </div>
        </header>
    );
}
