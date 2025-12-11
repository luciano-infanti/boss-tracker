'use client';

import { Calculator, Activity, Target, AlertCircle, Database, Zap, FileText } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Sobre
                </h1>
                <p className="text-secondary">
                    Um mergulho técnico nos modelos matemáticos e arquitetura de coleta de dados.
                </p>
            </div>

            <div className="space-y-8">
                {/* Data Collection Architecture */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="text-blue-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Arquitetura de Coleta de Dados</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-400" />
                                Scraping Paralelo Assíncrono
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed mb-4">
                                O sistema utiliza uma arquitetura assíncrona orientada a eventos impulsionada pelo <strong>Playwright</strong>.
                                Ele gera múltiplos contextos de navegador headless para fazer scraping dos mundos do jogo em paralelo, reduzindo significativamente o tempo de aquisição de dados enquanto mantém isolamento de sessão.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-400" />
                                Retenção "The Backpack"
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed mb-4">
                                Para prevenir perda de dados, o sistema implementa um mecanismo inteligente de retenção de histórico conhecido como <em>"The Backpack"</em>.
                                Antes de cada atualização, o histórico de mortes existente é carregado na memória, fundido com as novas descobertas diárias, e então persistido de volta ao armazenamento. Isso garante uma linha do tempo contínua e ininterrupta da atividade dos bosses.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mathematical Model */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-emerald-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Modelo de Previsão IAT Avançado</h2>
                    </div>
                    <p className="text-secondary leading-relaxed mb-6">
                        Evoluímos de médias simples para uma robusta <strong>Análise de Tempo Entre Chegadas (IAT)</strong>.
                        Esta abordagem estatística modela spawns de bosses não como um ponto único no tempo, mas como uma janela de probabilidade, considerando variância e "spawns fantasmas" (mortes perdidas).
                    </p>

                    <div className="bg-surface-hover/30 p-8 rounded-lg border border-border/50 overflow-x-auto">
                        <h3 className="text-white font-bold mb-6 border-b border-border/50 pb-2">Algoritmos Principais</h3>

                        <div className="space-y-10 font-mono text-sm">
                            {/* 1. IAT Calculation */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">1. Tempo Entre Chegadas (IAT)</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Primeiro calculamos o conjunto de todos os intervalos de tempo (Δt) entre mortes confirmadas consecutivas.
                                </p>
                                <div className="flex justify-center mb-4 bg-black/20 py-4 rounded border border-white/10">
                                    <img src="/images/formulas/iat.png" alt="Fórmula IAT" className="w-auto h-auto max-w-full opacity-90" />
                                </div>
                            </div>

                            {/* 2. Outlier Filtering */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">2. Filtragem de Spawn Fantasma (Corte de Percentil)</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Para filtrar "Spawns Fantasmas" (onde um boss apareceu mas não foi morto/registrado, levando a um intervalo de tamanho duplo), aplicamos um <strong>Filtro de Percentil 80</strong>.
                                    Qualquer intervalo maior que P80 é tratado como anomalia e excluído do cálculo do "Teto Provável".
                                </p>
                                <div className="flex justify-center mb-4 bg-black/20 py-4 rounded border border-white/10">
                                    <img src="/images/formulas/ghost_filter.png" alt="Fórmula Filtro Fantasma" className="w-auto h-auto max-w-full opacity-90" />
                                </div>
                            </div>

                            {/* 3. Window Definition */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">3. A Janela de Spawn</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Em vez de uma única data, definimos uma <strong>Janela de Spawn</strong> delimitada por um Piso de Segurança e um Teto Provável.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-4 rounded border border-white/10 flex flex-col items-center">
                                        <div className="text-blue-400 font-bold mb-1">Piso de Segurança (Mín)</div>
                                        <div className="text-xs text-secondary mb-3">O respawn mais cedo observado.</div>
                                        <img src="/images/formulas/min_gap.png" alt="Fórmula Gap Mín" className="w-auto h-auto max-w-full opacity-90" />
                                    </div>
                                    <div className="bg-black/20 p-4 rounded border border-white/10 flex flex-col items-center">
                                        <div className="text-orange-400 font-bold mb-1">Teto Provável (Máx)</div>
                                        <div className="text-xs text-secondary mb-3">O intervalo do percentil 80.</div>
                                        <img src="/images/formulas/max_gap.png" alt="Fórmula Gap Máx" className="w-auto h-auto max-w-full opacity-90" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Progress Calculation */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">4. Progresso da Janela</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Calculamos o quão dentro da janela de spawn estamos para atribuir uma pontuação de probabilidade.
                                </p>
                                <div className="flex justify-center mb-4 bg-black/20 py-4 rounded border border-white/10">
                                    <img src="/images/formulas/progress.png" alt="Fórmula Progresso" className="w-auto h-auto max-w-full opacity-90" />
                                </div>
                            </div>

                            {/* 5. Confidence Heuristic */}
                            <div>
                                <h4 className="text-primary font-bold mb-2 font-sans">5. Pontuação de Confiança</h4>
                                <p className="text-secondary mb-3 font-sans">
                                    Nem todas as previsões são iguais. Calculamos uma <strong>Pontuação de Confiança (0-100%)</strong> baseada em três fatores:
                                </p>
                                <ul className="list-disc list-inside text-secondary space-y-1 ml-2 mb-4">
                                    <li><strong>Tamanho da Amostra:</strong> Mais mortes = maior confiança (Escala logarítmica).</li>
                                    <li><strong>Consistência:</strong> Baixo Desvio Padrão (StdDev) = maior confiança.</li>
                                    <li><strong>Verificação Cruzada:</strong> Intervalos consistentes em múltiplos mundos aumentam a pontuação.</li>
                                </ul>
                                <div className="bg-black/20 p-4 rounded border border-white/10 text-xs font-mono text-secondary">
                                    Pontuação = Base(Amostras) × Consistência(StdDev) × BônusServidor
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual Representation */}
                <section className="bg-surface border border-border rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-blue-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Visualizando a Janela</h2>
                    </div>

                    <div className="relative pt-8 pb-12 px-4">
                        {/* Timeline Line */}
                        <div className="h-1 bg-border w-full absolute top-1/2 -translate-y-1/2"></div>

                        {/* Points */}
                        <div className="relative flex justify-between items-center h-20">
                            {/* Last Kill */}
                            <div className="absolute left-0 flex flex-col items-center -translate-x-1/2">
                                <div className="w-4 h-4 rounded-full bg-secondary border-4 border-surface"></div>
                                <div className="mt-4 text-xs text-secondary font-mono">Última Morte</div>
                                <div className="text-xs text-secondary/50">t=0</div>
                            </div>

                            {/* Min Gap (Start of Window) */}
                            <div className="absolute left-[40%] flex flex-col items-center -translate-x-1/2">
                                <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-surface z-10"></div>
                                <div className="absolute -top-8 text-blue-400 font-bold text-xs">Janela Abre</div>
                                <div className="mt-4 text-xs text-blue-400 font-mono">Gap Mín</div>
                            </div>

                            {/* Max Gap (End of Window) */}
                            <div className="absolute left-[80%] flex flex-col items-center -translate-x-1/2">
                                <div className="w-4 h-4 rounded-full bg-orange-500 border-4 border-surface z-10"></div>
                                <div className="absolute -top-8 text-orange-400 font-bold text-xs">Janela Fecha</div>
                                <div className="mt-4 text-xs text-orange-400 font-mono">Gap Máx</div>
                            </div>

                            {/* Window Bar */}
                            <div className="absolute left-[40%] right-[20%] h-2 bg-gradient-to-r from-blue-500/20 via-yellow-500/20 to-orange-500/20 border-x border-white/10 top-1/2 -translate-y-1/2 rounded-full"></div>

                            {/* Labels */}
                            <div className="absolute left-[60%] -translate-x-1/2 top-[60%] text-[10px] text-white/50 uppercase tracking-widest">
                                Zona de Alta Probabilidade
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                            <div className="text-blue-400 font-bold mb-1">Fase de Cooldown</div>
                            <div className="text-xs text-secondary">Antes do Gap Mín</div>
                            <div className="text-xs text-secondary mt-1">Probabilidade: 0%</div>
                        </div>
                        <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                            <div className="text-yellow-400 font-bold mb-1">Janela Ativa</div>
                            <div className="text-xs text-secondary">Gap Mín até Gap Máx</div>
                            <div className="text-xs text-secondary mt-1">Probabilidade: Aumenta com o tempo</div>
                        </div>
                        <div className="bg-surface-hover/20 p-4 rounded border border-border/50">
                            <div className="text-red-400 font-bold mb-1">Atrasado</div>
                            <div className="text-xs text-secondary">Após Gap Máx</div>
                            <div className="text-xs text-secondary mt-1">Boss provavelmente já nasceu ou foi perdido.</div>
                        </div>
                    </div>
                </section>

                <div className="text-right pt-8 border-t border-border">
                    <p className="text-secondary text-sm italic">
                        Por Even Worse, Lunarian
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
                        Ver Código Fonte no GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
