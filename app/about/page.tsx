'use client';

import { Calculator, Activity, Target, AlertCircle, Database, Zap, FileText } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Algorithm & Methodology
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
                        <h2 className="text-xl font-semibold text-white">The Prediction Model</h2>
                    </div>
                    <p className="text-secondary leading-relaxed mb-6">
                        The core of our prediction engine relies on <strong>Time Series Analysis</strong> of historical kill data.
                        We model the spawn behavior as a stochastic process with a periodic component.
                    </p>

                    <div className="bg-surface-hover/30 p-8 rounded-lg border border-border/50 overflow-x-auto">
                        <h3 className="text-white font-bold mb-6 border-b border-border/50 pb-2">Mathematical Formulation</h3>

                        <div className="space-y-8 font-serif">
                            {/* Set Definition */}
                            <div>
                                <p className="text-secondary text-sm mb-2 font-sans">Let <span className="font-serif italic">K</span> be the ordered set of kill timestamps:</p>
                                <div className="flex justify-center my-4">
                                    <span className="text-xl text-white bg-black/20 px-6 py-3 rounded border border-white/10">
                                        K = &#123; t_1, t_2, ..., t_n &#125; : t_i &lt; t_&#123;i+1&#125;
                                    </span>
                                </div>
                            </div>

                            {/* Interval Calculation */}
                            <div>
                                <p className="text-secondary text-sm mb-2 font-sans">We define the spawn interval <span className="font-serif italic">Δt</span> as the time difference between consecutive events:</p>
                                <div className="flex justify-center my-4">
                                    <span className="text-xl text-white bg-black/20 px-6 py-3 rounded border border-white/10">
                                        Δt_i = t_i - t_&#123;i-1&#125;, \quad \forall i \in [2, n]
                                    </span>
                                </div>
                            </div>

                            {/* Mean Interval */}
                            <div>
                                <p className="text-secondary text-sm mb-2 font-sans">The predicted mean interval <span className="font-serif italic">μ</span> is the arithmetic mean of observed intervals:</p>
                                <div className="flex justify-center my-4">
                                    <span className="text-xl text-white bg-black/20 px-6 py-3 rounded border border-white/10">
                                        \mu = \frac&#123;1&#125;&#123;n-1&#125; \sum_&#123;i=2&#125;^&#123;n&#125; \Delta t_i
                                    </span>
                                </div>
                            </div>

                            {/* Prediction */}
                            <div>
                                <p className="text-secondary text-sm mb-2 font-sans">The next expected spawn date <span className="font-serif italic">D_&#123;next&#125;</span> is projected as:</p>
                                <div className="flex justify-center my-4">
                                    <span className="text-xl text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded border border-emerald-500/20">
                                        D_&#123;next&#125; = t_n + \mu
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Precision & Constraints */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-yellow-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Precision & Confidence</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-medium mb-2">Minimum Data Requirements</h3>
                            <p className="text-secondary">
                                To generate a valid prediction, the algorithm requires a minimum of <strong>2 confirmed kills</strong> (n ≥ 2).
                                With only 1 kill, it is mathematically impossible to calculate an interval (Δt), and thus the prediction returns "N/A".
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                                <div className="text-red-400 font-bold mb-1">Low Confidence</div>
                                <div className="text-xs text-secondary">n = 2 kills</div>
                                <div className="text-xs text-secondary mt-1">Single interval observed. High variance risk.</div>
                            </div>
                            <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                                <div className="text-yellow-400 font-bold mb-1">Medium Confidence</div>
                                <div className="text-xs text-secondary">n = 3-5 kills</div>
                                <div className="text-xs text-secondary mt-1">Pattern begins to emerge. Outliers may skew results.</div>
                            </div>
                            <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                                <div className="text-emerald-400 font-bold mb-1">High Confidence</div>
                                <div className="text-xs text-secondary">n &gt; 5 kills</div>
                                <div className="text-xs text-secondary mt-1">Robust average. Anomalies are smoothed out.</div>
                            </div>
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
