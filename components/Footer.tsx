'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tools = [
    { name: 'Stats', href: 'https://stats.rubinot.app/' },
    { name: 'Hunts', href: 'https://hunts.rubinot.app/' },
    { name: 'Bosses', href: '/stats' },
];

// Contact Modal Component
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate submission - replace with actual email logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        onClose();
        setFormData({ name: '', email: '', message: '' });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 className="text-2xl text-white mb-1 font-bold">Fale Conosco</h2>
                    <p className="text-white/50 text-sm mb-6">Adoraríamos ouvir de você!</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-xs text-white/50 mb-1.5">Nome</label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs text-white/50 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-xs text-white/50 mb-1.5">Mensagem</label>
                            <textarea
                                id="message"
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                placeholder="Sua mensagem..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-colors duration-200 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Contribute Modal Component
function ContributeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header with coin icon */}
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src="https://wiki.rubinot.com/items/rubinot/rubini-coins.gif"
                            alt="Rubini Coins"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                        <h2 className="text-2xl text-white font-bold">Obrigado!</h2>
                    </div>

                    <p className="text-white/70 text-sm mb-6">
                        Sua contribuição ajuda a manter o site funcionando!
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-white font-semibold text-base">Como ajudar:</h3>

                        {/* Step 1 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-400 text-sm font-bold">1</span>
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Abra a Store no jogo</p>
                                <p className="text-white/50 text-xs mt-0.5">Clique no ícone da Store no client</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-400 text-sm font-bold">2</span>
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Envie Rubini Coins</p>
                                <p className="text-white/50 text-xs mt-0.5">
                                    Use a função Gift para enviar para: <span className="text-white font-bold">Even Worse</span>
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                    Envie quantas coins seu coração mandar ♥
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-colors duration-200"
                    >
                        Entendi!
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function Footer() {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isContributeOpen, setIsContributeOpen] = useState(false);

    return (
        <>
            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            <ContributeModal isOpen={isContributeOpen} onClose={() => setIsContributeOpen(false)} />

            <footer className="py-16 mt-auto relative z-10 border-t border-white/[0.06] bg-surface">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Main footer content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        {/* Logo & Actions */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Link href="/stats" className="flex items-center gap-2.5">
                                <img
                                    src="https://www.tibiawiki.com.br/images/e/e9/Yeti.gif"
                                    alt="RubinOT"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                                <span className="text-2xl text-white tracking-tight font-bold">
                                    RUBINOT<span className="text-purple-400">APP</span>
                                </span>
                            </Link>
                            <p className="text-white/40 text-sm text-center md:text-left">
                                O seu portal de RubinOT.
                            </p>

                            {/* Social Icons */}
                            <div className="flex items-center gap-3 mt-2">
                                <a
                                    href="https://github.com/luciano-infanti/boss-tracker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors duration-200"
                                    aria-label="GitHub"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://discord.gg/rubinot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors duration-200"
                                    aria-label="Discord"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Contribute button */}
                        <div className="flex flex-col items-center md:items-end md:justify-center">
                            <button
                                onClick={() => setIsContributeOpen(true)}
                                className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                            >
                                <img
                                    src="https://wiki.rubinot.com/items/rubinot/rubini-coins.gif"
                                    alt="Rubini Coins"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                                Contribuir
                            </button>
                        </div>
                    </div>

                    {/* Bottom: Credits */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.04]">
                        <p className="text-white/25 text-xs">
                            © {new Date().getFullYear()} RubinOT Boss Tracker. All rights reserved.
                        </p>

                        <p className="text-white/40 text-xs">
                            Made with <span className="text-purple-400">♥</span> by Even Worse, Lunarian
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
