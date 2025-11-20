'use client';

import { Calculator, Activity, Target, AlertCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Algorithm & Methodology
                </h1>
                <p className="text-secondary">
                    A technical deep dive into the mathematical models used for boss respawn predictions.
                </p>
            </div>

            <div className="space-y-8">
                {/* Core Concept */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-emerald-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">The Prediction Model</h2>
                    </div>
                    <p className="text-secondary leading-relaxed mb-6">
                        The core of our prediction engine relies on <strong>Time Series Analysis</strong> of historical kill data.
                        Unlike static timers, our algorithm dynamically adapts to the observed behavior of each boss across multiple game worlds.
                    </p>

                    <div className="bg-surface-hover/30 p-6 rounded-lg border border-border/50 font-mono text-sm text-gray-300 overflow-x-auto">
                        <h3 className="text-white font-bold mb-4">Mathematical Formulation</h3>

                        <p className="mb-4">
                            Let <span className="text-primary">K</span> be the ordered set of kill dates for a specific boss:
                            <br />
                            <span className="block mt-2 bg-black/20 p-3 rounded text-emerald-400">
                                K = &#123; t_1, t_2, ..., t_n &#125; where t_i &lt; t_&#123;i+1&#125;
                            </span>
                        </p>

                        <p className="mb-4">
                            We define the spawn interval <span className="text-yellow-400">Δt</span> between consecutive kills as:
                            <br />
                            <span className="block mt-2 bg-black/20 p-3 rounded text-yellow-400">
                                Δt_i = t_i - t_&#123;i-1&#125; for i ∈ [2, n]
                            </span>
                        </p>

                        <p>
                            The predicted mean interval <span className="text-blue-400">μ</span> is calculated as the arithmetic mean of all observed intervals:
                            <br />
                            <span className="block mt-2 bg-black/20 p-3 rounded text-blue-400">
                                μ = (1 / (n-1)) * Σ(Δt_i)
                            </span>
                        </p>
                    </div>
                </section>

                {/* Next Spawn Calculation */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-primary" size={24} />
                        <h2 className="text-xl font-semibold text-white">Next Respawn Calculation</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-medium mb-3">The Formula</h3>
                            <p className="text-secondary mb-4">
                                The next expected spawn date <span className="text-emerald-400">D_next</span> is projected by adding the calculated mean interval to the most recent kill date.
                            </p>
                            <div className="bg-surface-hover/30 p-4 rounded border border-border/50 font-mono text-sm text-white">
                                D_next = t_n + round(μ)
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-medium mb-3">Frequency Classification</h3>
                            <p className="text-secondary mb-2">We categorize bosses based on μ:</p>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    <span><strong>Daily:</strong> μ ≈ 1.0 days</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                    <span><strong>Weekly:</strong> μ ≈ 7.0 days</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    <span><strong>Monthly:</strong> μ ≈ 30.0 days</span>
                                </li>
                            </ul>
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
            </div>
        </div>
    );
}
