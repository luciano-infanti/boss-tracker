'use client';

import { Calculator, Activity, Target, AlertCircle, Database, Zap, FileText } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    About
                </h1>
                <p className="text-secondary">
                    A technical deep dive into the mathematical models and data collection architecture.
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

                {/* Mathematical Model */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-emerald-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Advanced IAT Prediction Model</h2>
                    </div>
                    <p className="text-secondary leading-relaxed mb-6">
                        We have evolved from simple averages to a robust <strong>Inter-Arrival Time (IAT) Analysis</strong>.
                        This statistical approach models boss spawns not as a single point in time, but as a probability window, accounting for variance and "ghost spawns" (missed kills).
                    </p>

                    <div className="bg-surface-hover/30 p-8 rounded-lg border border-border/50 overflow-x-auto">
                        <h3 className="text-white font-bold mb-6 border-b border-border/50 pb-2">Core Algorithms</h3>

                        <div className="space-y-10 font-mono text-sm">
                            {/* 1. IAT Calculation */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">1. Inter-Arrival Time (IAT)</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    We first calculate the set of all time gaps (Δt) between consecutive confirmed kills.
                                </p>
                                <div className="flex justify-center mb-4 bg-black/20 py-4 rounded border border-white/10">
                                    <img src="/images/formulas/iat.png" alt="IAT Formula" className="w-auto h-auto max-w-full opacity-90" />
                                </div>
                            </div>

                            {/* 2. Outlier Filtering */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">2. Ghost Spawn Filtering (Percentile Cutoff)</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    To filter out "Ghost Spawns" (where a boss spawned but wasn't killed/recorded, leading to a double-length gap), we apply an <strong>80th Percentile Filter</strong>.
                                    Any gap larger than P80 is treated as an anomaly and excluded from the "Likely Ceiling" calculation.
                                </p>
                                <div className="flex justify-center mb-4 bg-black/20 py-4 rounded border border-white/10">
                                    <img src="/images/formulas/ghost_filter.png" alt="Ghost Filter Formula" className="w-auto h-auto max-w-full opacity-90" />
                                </div>
                            </div>

                            {/* 3. Window Definition */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">3. The Spawn Window</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Instead of a single date, we define a <strong>Spawn Window</strong> bounded by a Safety Floor and a Likely Ceiling.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-4 rounded border border-white/10 flex flex-col items-center">
                                        <div className="text-blue-400 font-bold mb-1">Safety Floor (Min)</div>
                                        <div className="text-xs text-secondary mb-3">The earliest observed respawn.</div>
                                        <img src="/images/formulas/min_gap.png" alt="Min Gap Formula" className="w-auto h-auto max-w-full opacity-90" />
                                    </div>
                                    <div className="bg-black/20 p-4 rounded border border-white/10 flex flex-col items-center">
                                        <div className="text-orange-400 font-bold mb-1">Likely Ceiling (Max)</div>
                                        <div className="text-xs text-secondary mb-3">The 80th percentile gap.</div>
                                        <img src="/images/formulas/max_gap.png" alt="Max Gap Formula" className="w-auto h-auto max-w-full opacity-90" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Progress Calculation */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">4. Window Progress</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    We calculate how deep we are into the spawn window to assign a probability score.
                                </p>
                                <div className="flex justify-center mb-4 bg-black/20 py-4 rounded border border-white/10">
                                    <img src="/images/formulas/progress.png" alt="Progress Formula" className="w-auto h-auto max-w-full opacity-90" />
                                </div>
                            </div>

                            {/* 5. Confidence Heuristic */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">5. Confidence Score</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Not all predictions are equal. We calculate a <strong>Confidence Score (0-100%)</strong> based on three factors:
                                </p>
                                <ul className="list-disc list-inside text-secondary space-y-1 ml-2 mb-4">
                                    <li><strong>Sample Size:</strong> More kills = higher confidence (Logarithmic scale).</li>
                                    <li><strong>Consistency:</strong> Low Standard Deviation (StdDev) = higher confidence.</li>
                                    <li><strong>Cross-Server Verification:</strong> Consistent intervals across multiple worlds boost the score.</li>
                                </ul>
                                <div className="bg-black/20 p-4 rounded border border-white/10 text-xs font-mono text-secondary">
                                    Score = Base(Samples) × Consistency(StdDev) × ServerBonus
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual Representation */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-blue-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Visualizing the Window</h2>
                    </div>

                    <div className="relative pt-8 pb-12 px-4">
                        {/* Timeline Line */}
                        <div className="h-1 bg-border w-full absolute top-1/2 -translate-y-1/2"></div>

                        {/* Points */}
                        <div className="relative flex justify-between items-center h-20">
                            {/* Last Kill */}
                            <div className="absolute left-0 flex flex-col items-center -translate-x-1/2">
                                <div className="w-4 h-4 rounded-full bg-secondary border-4 border-surface"></div>
                                <div className="mt-4 text-xs text-secondary font-mono">Last Kill</div>
                                <div className="text-xs text-secondary/50">t=0</div>
                            </div>

                            {/* Min Gap (Start of Window) */}
                            <div className="absolute left-[40%] flex flex-col items-center -translate-x-1/2">
                                <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-surface z-10"></div>
                                <div className="absolute -top-8 text-blue-400 font-bold text-xs">Window Opens</div>
                                <div className="mt-4 text-xs text-blue-400 font-mono">Min Gap</div>
                            </div>

                            {/* Max Gap (End of Window) */}
                            <div className="absolute left-[80%] flex flex-col items-center -translate-x-1/2">
                                <div className="w-4 h-4 rounded-full bg-orange-500 border-4 border-surface z-10"></div>
                                <div className="absolute -top-8 text-orange-400 font-bold text-xs">Window Closes</div>
                                <div className="mt-4 text-xs text-orange-400 font-mono">Max Gap</div>
                            </div>

                            {/* Window Bar */}
                            <div className="absolute left-[40%] right-[20%] h-2 bg-gradient-to-r from-blue-500/20 via-yellow-500/20 to-orange-500/20 border-x border-white/10 top-1/2 -translate-y-1/2 rounded-full"></div>

                            {/* Labels */}
                            <div className="absolute left-[60%] -translate-x-1/2 top-[60%] text-[10px] text-white/50 uppercase tracking-widest">
                                High Probability Zone
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                            <div className="text-blue-400 font-bold mb-1">Cooldown Phase</div>
                            <div className="text-xs text-secondary">Before Min Gap</div>
                            <div className="text-xs text-secondary mt-1">Probability: 0%</div>
                        </div>
                        <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                            <div className="text-yellow-400 font-bold mb-1">Active Window</div>
                            <div className="text-xs text-secondary">Min Gap to Max Gap</div>
                            <div className="text-xs text-secondary mt-1">Probability: Increases with time</div>
                        </div>
                        <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                            <div className="text-red-400 font-bold mb-1">Overdue</div>
                            <div className="text-xs text-secondary">After Max Gap</div>
                            <div className="text-xs text-secondary mt-1">Boss is likely already spawned or missed.</div>
                        </div>
                    </div>
                </section>

                <div className="text-right pt-8 border-t border-border">
                    <p className="text-secondary text-sm italic">
                        By Even Worse, Lunarian
                    </p>
                    <a
                        href="https://github.com/luciano-infanti/boss-tracker"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-xs text-secondary hover:text-primary transition-colors"
                    >
                        <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        View Source on GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
