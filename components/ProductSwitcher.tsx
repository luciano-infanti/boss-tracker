"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, Check } from "lucide-react";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string;
    href: string;
    icon: React.ReactNode | null;
    customImage?: string;
    gradient: string;
    current?: boolean;
}

const products: Product[] = [
    {
        id: "stats",
        name: "Stats.RubinOT",
        description: "Análises e estatísticas avançadas",
        href: "https://stats.rubinot.app/",
        icon: null,
        customImage: "https://rubinot.app/_next/image?url=%2Fstats-icon.png&w=256&q=75",
        gradient: "from-emerald-500 to-emerald-700",
    },
    {
        id: "hunts",
        name: "Hunts.RubinOT",
        description: "Gerencie suas sessões de caça",
        href: "https://hunts.rubinot.app/",
        icon: null,
        customImage: "https://wiki.rubinot.com/icons/ranked-icon.gif",
        gradient: "from-purple-500 to-purple-700",
    },
    {
        id: "bosses",
        name: "Bosses.RubinOT",
        description: "Timers e tracking de bosses",
        href: "/stats",
        icon: null,
        customImage: "https://www.tibiawiki.com.br/images/e/e9/Yeti.gif",
        gradient: "from-amber-500 to-amber-700",
        current: true,
    },
];

export function ProductSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const currentProduct = products.find(p => p.current) || products[0];

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger */}
            <button
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.06] hover:bg-zinc-800/80 hover:border-white/[0.1] transition-all duration-200 group"
            >
                {/* Current Product Logo */}
                {currentProduct.customImage ? (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <img 
                            src={currentProduct.customImage} 
                            alt={currentProduct.name}
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                ) : (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentProduct.gradient} flex items-center justify-center`}>
                        {currentProduct.icon}
                    </div>
                )}

                {/* Product Name */}
                <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                    {currentProduct.name}
                </span>

                {/* Chevrons */}
                <ChevronsUpDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.8,
                        }}
                        className="absolute top-full left-0 mt-2 w-72 p-2 bg-zinc-950/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 z-50"
                    >
                        {/* Header */}
                        <div className="px-3 py-2 mb-1">
                            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                                Trocar Ferramenta
                            </span>
                        </div>

                        {/* Product List */}
                        <div className="space-y-1">
                            {products.map((product) => {
                                const isExternal = product.href.startsWith('http');
                                
                                const content = (
                                    <>
                                        {/* Product Logo */}
                                        {product.customImage ? (
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                <img 
                                                    src={product.customImage} 
                                                    alt={product.name}
                                                    className="w-7 h-7 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                                                {product.icon}
                                            </div>
                                        )}

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-semibold tracking-tight transition-colors duration-150 ${product.current ? 'text-white' : 'text-zinc-300 group-hover/item:text-white'}`}>
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-zinc-500 truncate">
                                                {product.description}
                                            </div>
                                        </div>

                                        {/* Current Indicator */}
                                        {product.current && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ 
                                                    type: "spring", 
                                                    stiffness: 500, 
                                                    damping: 25 
                                                }}
                                                className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20"
                                            >
                                                <Check className="h-3 w-3 text-purple-400" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </>
                                );

                                const className = `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group/item ${product.current ? 'bg-white/[0.06]' : 'hover:bg-zinc-800/50'}`;

                                if (isExternal) {
                                    return (
                                        <a
                                            key={product.id}
                                            href={product.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={className}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {content}
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={product.id}
                                        href={product.href}
                                        className={className}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
