'use client';


import { X } from 'lucide-react';

interface FilterPillProps {
    label: string;
    active: boolean;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    icon?: string;
    removable?: boolean;
}

export default function FilterPill({
    label,
    active,
    onClick,
    variant = 'primary',
    icon,
    removable = true
}: FilterPillProps) {
    // Calculate padding classes based on state
    const paddingRight = active && removable ? 'pr-2' : 'pr-4';
    const paddingLeft = icon
        ? (active ? 'pl-2' : 'pl-3')
        : (active ? 'pl-4' : 'pl-4');

    return (
        <button
            onClick={onClick}
            className={`
                py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 
                ${paddingRight} ${paddingLeft}
                ${active
                    ? 'bg-surface-hover text-white border-primary/50 shadow-sm'
                    : 'bg-surface text-secondary border-border hover:border-border/80 hover:text-white'
                }
            `}
        >
            {icon && (
                <img
                    src={icon}
                    alt=""
                    className="w-5 h-5 object-contain rounded-full"
                />
            )}
            <span className="whitespace-nowrap">
                {label}
            </span>
            {active && removable && (
                <div className="flex items-center justify-center ml-1">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                        <X size={10} className="text-white" />
                    </div>
                </div>
            )}
        </button>
    );
}
