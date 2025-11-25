'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOSS_CATEGORY_ICONS } from '@/utils/bossCategories';

interface CategoryDropdownProps {
    value: string;
    onChange: (value: string) => void;
    categories: string[];
}

export default function CategoryDropdown({ value, onChange, categories }: CategoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (category: string) => {
        onChange(category);
        setIsOpen(false);
    };

    const getIcon = (category: string) => {
        // @ts-ignore
        return BOSS_CATEGORY_ICONS[category];
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-surface-hover hover:bg-surface-hover/80 text-xs text-white border border-border rounded px-3 py-1.5 transition-colors outline-none focus:border-primary/50"
            >
                {value !== 'All' && getIcon(value) && (
                    <img
                        src={getIcon(value)}
                        alt=""
                        className="w-4 h-4 object-contain rounded-full"
                    />
                )}
                <span className="font-medium">{value}</span>
                <ChevronDown size={14} className={`text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-1 w-40 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden py-1"
                    >
                        <button
                            onClick={() => handleSelect('All')}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-surface-hover transition-colors ${value === 'All' ? 'text-primary bg-primary/10' : 'text-secondary'}`}
                        >
                            <span>All</span>
                            {value === 'All' && <Check size={14} />}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleSelect(category)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-surface-hover transition-colors ${value === category ? 'text-primary bg-primary/10' : 'text-secondary'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {getIcon(category) && (
                                        <img
                                            src={getIcon(category)}
                                            alt=""
                                            className="w-4 h-4 object-contain rounded-full"
                                        />
                                    )}
                                    <span>{category}</span>
                                </div>
                                {value === category && <Check size={14} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
