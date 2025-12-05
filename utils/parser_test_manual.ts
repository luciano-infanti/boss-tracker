
// Mock types
interface Boss {
    name: string;
    totalDaysSpawned: number;
    totalKills: number;
    spawnFrequency: string;
    nextExpectedSpawn: string;
    lastKillDate: string;
    history: string;
}

interface KillDateEntry {
    date: string;
    world: string;
    count: number;
}

interface BossKillHistory {
    bossName: string;
    totalSpawnDays: number;
    totalKills: number;
    killsByWorld: { [world: string]: KillDateEntry[] };
    chronologicalHistory: KillDateEntry[];
}

// Copied function to test
function aggregateKillHistory(worlds: Record<string, Boss[]>): BossKillHistory[] {
    const historyMap = new Map<string, BossKillHistory>();

    Object.entries(worlds).forEach(([worldName, bosses]) => {
        bosses.forEach(boss => {
            if (!boss.history || boss.history === 'None') return;

            if (!historyMap.has(boss.name)) {
                historyMap.set(boss.name, {
                    bossName: boss.name,
                    totalSpawnDays: 0,
                    totalKills: 0,
                    killsByWorld: {},
                    chronologicalHistory: []
                });
            }

            const entry = historyMap.get(boss.name)!;
            entry.totalSpawnDays += boss.totalDaysSpawned;
            entry.totalKills += boss.totalKills;

            // Parse history: "11/11/2025 (1x)" or "11/11/2025"
            const historyEntries = boss.history.split(',').map(s => s.trim());
            const killDates: any[] = [];

            historyEntries.forEach(h => {
                // Relaxed regex: Optional count, optional spaces
                const match = h.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*\((\d+)x\))?$/);
                if (match) {
                    const [_, day, month, year, countStr] = match;
                    const count = countStr ? parseInt(countStr) : 1;
                    const dateStr = `${day}/${month}/${year}`;

                    for (let i = 0; i < count; i++) {
                        killDates.push({ date: dateStr, world: worldName, count: 1 });
                        entry.chronologicalHistory.push({ date: dateStr, world: worldName, count: 1 });
                    }
                }
            });

            entry.killsByWorld[worldName] = killDates;
        });
    });

    return Array.from(historyMap.values());
}

// Test Data
const mockBoss: Boss = {
    name: 'Mahatheb',
    totalDaysSpawned: 9,
    totalKills: 10,
    spawnFrequency: 'once every ~3.2 days',
    nextExpectedSpawn: '06/12/2025',
    lastKillDate: '03/12/2025',
    history: '07/11/2025 (1x), 09/11/2025 (1x), 10/11/2025 (1x), 11/11/2025 (1x), 20/11/2025 (2x), 22/11/2025 (1x), 01/12/2025 (1x), 02/12/2025 (1x), 03/12/2025 (1x)'
};

const mockBossNoCount: Boss = {
    name: 'TestBoss',
    totalDaysSpawned: 1,
    totalKills: 1,
    spawnFrequency: 'N/A',
    nextExpectedSpawn: 'N/A',
    lastKillDate: '03/12/2025',
    history: '03/12/2025' // No (1x)
};

const mockWorlds: Record<string, Boss[]> = {
    'Belaria': [mockBoss, mockBossNoCount]
};

console.log('Testing aggregateKillHistory...');
const result = aggregateKillHistory(mockWorlds);

console.log('Result length:', result.length);

const mahatheb = result.find(b => b.bossName === 'Mahatheb');
if (mahatheb) {
    console.log('Mahatheb Total Kills:', mahatheb.totalKills);
    const dec3 = mahatheb.chronologicalHistory.find(k => k.date === '03/12/2025');
    console.log('Mahatheb Found 03/12/2025:', !!dec3);
}

const testBoss = result.find(b => b.bossName === 'TestBoss');
if (testBoss) {
    console.log('TestBoss Total Kills:', testBoss.totalKills);
    const dec3 = testBoss.chronologicalHistory.find(k => k.date === '03/12/2025');
    console.log('TestBoss Found 03/12/2025:', !!dec3);
}
