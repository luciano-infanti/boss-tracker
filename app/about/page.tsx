'use client';

import { Calculator } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    About the Algorithm
                </h1>
                <p className="text-secondary">
                    Understanding how we calculate boss spawn predictions.
                </p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-8 space-y-8">
                <section>
                    <h2 className="text-lg font-medium text-white mb-4">Introduction</h2>
                    <p className="text-secondary leading-relaxed">
                        The boss spawn prediction algorithm uses historical kill data to estimate the next likely appearance window for each boss.
                        By analyzing the intervals between past kills, we can determine a pattern and project it into the future.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-white mb-4">The Formula</h2>
                    <div className="bg-surface-hover/30 p-6 rounded-lg border border-border/50 font-mono text-sm text-gray-300 overflow-x-auto">
                        <p className="mb-4">
                            Let <span className="text-primary">K</span> be the set of all kill dates for a specific boss.
                        </p>
                        <p className="mb-4">
                            We calculate the interval <span className="text-yellow-400">Δt</span> between consecutive kills:
                            <br />
                            <span className="block mt-2 bg-black/20 p-2 rounded">
                                Δt_i = date(K_i) - date(K_&#123;i-1&#125;)
                            </span>
                        </p>
                        <p>
                            The predicted next spawn date <span className="text-emerald-400">D_next</span> is estimated based on the average or median interval added to the last known kill date.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-white mb-4">Confidence Score</h2>
                    <p className="text-secondary leading-relaxed">
                        Predictions are assigned a confidence score based on the regularity of the spawn intervals.
                        Bosses with highly variable intervals have lower confidence scores, while those with strict schedules have higher scores.
                    </p>
                </section>
            </div>
        </div>
    );
}
