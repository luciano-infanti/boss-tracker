'use client';

import { Calculator, Activity, Target, AlertCircle, Database, Zap, FileText, ShieldCheck, BarChart3 } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Just About
                </h1>
                <p className="text-secondary">
                    A technical deep dive into the robust statistical models and data collection architecture.
                </p>
            </div>

            <div className="space-y-8">
                {/* Data Collection Architecture */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="text-blue-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Data Collection Architecture</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-400" />
                                Async Parallel Scraping
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed mb-4">
                                The system utilizes an asynchronous, event-driven architecture powered by <strong>Playwright</strong>.
                                It spawns multiple headless browser contexts to scrape game worlds in parallel, significantly reducing data acquisition time while maintaining session isolation.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-400" />
                                "The Backpack" Retention
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed mb-4">
                                To prevent data loss, the system implements a smart history retention mechanism known as <em>"The Backpack"</em>.
                                Before every update, existing kill history is loaded into memory, merged with new daily findings, and then persisted back to storage. This ensures a continuous, unbroken timeline of boss activity.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Robust Statistical Model */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="text-emerald-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Robust Statistical Model</h2>
                    </div>
                    <p className="text-secondary leading-relaxed mb-6">
                        We have evolved from simple arithmetic means to a <strong>Robust Statistical Framework</strong> designed to handle the irregularities of game data, such as missed scans or server downtimes.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-surface-hover/20 p-5 rounded border border-border/50">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <BarChart3 size={18} className="text-purple-400" />
                                Median vs. Mean
                            </h3>
                            <p className="text-sm text-secondary">
                                We use the <strong>Median</strong> interval instead of the Mean. The Median is resistant to massive outliers (e.g., a missed scan that makes an interval look like 50 days instead of 5).
                            </p>
                        </div>
                        <div className="bg-surface-hover/20 p-5 rounded border border-border/50">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Activity size={18} className="text-orange-400" />
                                Volatility (σ)
                            </h3>
                            <p className="text-sm text-secondary">
                                We calculate the <strong>Standard Deviation (σ)</strong> to measure how "random" a boss is. A low σ means the boss is clockwork; a high σ means it's chaotic.
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-hover/30 p-8 rounded-lg border border-border/50 overflow-x-auto">
                        <h3 className="text-white font-bold mb-6 border-b border-border/50 pb-2">Mathematical Formulation</h3>

                        <div className="space-y-8 font-serif">
                            {/* Outlier Filtering */}
                            <div>
                                <p className="text-secondary text-sm mb-2 font-sans">
                                    <strong>1. Outlier Filtering (IQR):</strong> We first filter the set of intervals <span className="font-serif italic">I</span> using the Interquartile Range to remove anomalies.
                                </p>
                                <div className="flex justify-center my-4">
                                    <span className="text-lg text-white bg-black/20 px-6 py-3 rounded border border-white/10">
                                        IQR = Q_3 - Q_1 \quad \text{where} \quad Q_1, Q_3 \in \text{Quartiles}(I)
                                    </span>
                                </div>
                                <div className="flex justify-center my-2">
                                    <span className="text-sm text-gray-400">
                                        Keep x \in I \iff Q_1 - 1.5 \cdot IQR \le x \le Q_3 + 1.5 \cdot IQR
                                    </span>
                                </div>
                            </div>

                            {/* Prediction Window */}
                            <div>
                                <p className="text-secondary text-sm mb-2 font-sans">
                                    <strong>2. Prediction Window:</strong> Instead of a single date, we calculate a 95% Probability Window based on the Median and Standard Deviation ($\sigma$).
                                </p>
                                <div className="flex justify-center my-4">
                                    <span className="text-xl text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded border border-emerald-500/20">
                                        W = (t_n + \text{Median}) \pm 1.5\sigma
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Classification & Status */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-primary" size={24} />
                        <h2 className="text-xl font-semibold text-white">Classification & Status</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-medium mb-3">Volatility Classes</h3>
                            <ul className="space-y-3 text-sm text-secondary">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <div>
                                        <strong className="text-white block">🕒 Precise (σ &lt; 1.0)</strong>
                                        <span>Clockwork spawns. Camp the exact hour.</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                    <div>
                                        <strong className="text-white block">🎲 Regular (σ &lt; 3.0)</strong>
                                        <span>Predictable but has some variance.</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    <div>
                                        <strong className="text-white block">🌀 Chaotic (σ ≥ 3.0)</strong>
                                        <span>Highly random. Hard to predict.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-medium mb-3">Prediction Status</h3>
                            <ul className="space-y-3 text-sm text-secondary">
                                <li className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">🔥 VERY OVERDUE</span>
                                    <span>Current date &gt; Max Window. Spawn is imminent.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">⚡ ACTIVE WINDOW</span>
                                    <span>Current date is inside the probability window.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">💤 SLEEPS</span>
                                    <span>Not expected yet. Days remaining shown.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="text-right pt-8 border-t border-border">
                    <p className="text-secondary text-sm italic">
                        By Even Worse, Lunarian
                    </p>
                </div>
            </div>
        </div>
    );
}
