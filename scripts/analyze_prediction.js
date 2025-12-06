// Script to analyze specific boss predictions
const fs = require('fs');
const path = require('path');

// Helper to parse DD/MM/YYYY dates
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Helper to calculate days between dates
function differenceInDays(date1, date2) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((date1 - date2) / msPerDay);
}

// Analyze a boss
function analyzeBoss(bossName, killData) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ANALYZING: ${bossName}`);
    console.log('='.repeat(60));

    if (!killData || !killData.worlds) {
        console.log('No data available');
        return;
    }

    const allGaps = [];
    const worldGaps = {};

    // Process each world
    Object.entries(killData.worlds).forEach(([worldName, historyString]) => {
        if (!historyString || historyString === 'No kills recorded') return;

        // Parse dates from history string
        const dateMatches = historyString.match(/\d{2}\/\d{2}\/\d{4}/g);
        if (!dateMatches || dateMatches.length < 2) return;

        const dates = dateMatches.map(parseDate).sort((a, b) => a - b);
        const gaps = [];

        console.log(`\n📍 World: ${worldName}`);
        console.log(`   Kill Dates: ${dateMatches.join(', ')}`);

        // Calculate gaps
        for (let i = 1; i < dates.length; i++) {
            const gap = differenceInDays(dates[i], dates[i - 1]);
            if (gap >= 1) {
                gaps.push(gap);
                allGaps.push(gap);
                console.log(`   Gap ${i}: ${dateMatches[i - 1]} → ${dateMatches[i]} = ${gap} days`);
            }
        }

        worldGaps[worldName] = gaps;
    });

    if (allGaps.length === 0) {
        console.log('\n❌ Not enough data (need at least 2 kills)');
        return;
    }

    console.log(`\n📊 ALL GAPS (combined from all worlds): [${allGaps.join(', ')}]`);
    console.log(`   Total gaps collected: ${allGaps.length}`);

    // Sort gaps
    allGaps.sort((a, b) => a - b);
    console.log(`   Sorted gaps: [${allGaps.join(', ')}]`);

    // Apply 80th percentile filter (Ghost Spawn Filter)
    const p80Index = Math.floor(allGaps.length * 0.80);
    const filteredGaps = allGaps.slice(0, p80Index + 1);

    console.log(`\n🔍 GHOST SPAWN FILTER (80th Percentile)`);
    console.log(`   80th percentile index: ${p80Index}`);
    console.log(`   Filtered gaps (removing top 20%): [${filteredGaps.join(', ')}]`);

    // Calculate statistics
    const minGap = filteredGaps[0];
    const maxGap = filteredGaps[filteredGaps.length - 1];

    // Calculate median (50th percentile) for avg
    const medianIndex = Math.floor(filteredGaps.length * 0.50);
    const avgGap = Math.floor(filteredGaps[medianIndex]);

    const mean = filteredGaps.reduce((a, b) => a + b, 0) / filteredGaps.length;
    const variance = filteredGaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filteredGaps.length;
    const stdDev = Math.sqrt(variance);

    console.log(`\n📈 FINAL STATISTICS`);
    console.log(`   Min Gap: ${minGap} days (earliest observed respawn)`);
    console.log(`   Max Gap: ${maxGap} days (80th percentile - "Likely Ceiling")`);
    console.log(`   Avg Gap: ${avgGap} days (median/50th percentile)`);
    console.log(`   StdDev: ${stdDev.toFixed(2)} days`);
    console.log(`   Sample Size: ${allGaps.length} gaps`);

    // Calculate confidence
    const serverCount = Object.keys(worldGaps).length;
    const baseScore = Math.min(100, (Math.log(allGaps.length + 1) / Math.log(15)) * 100);
    const range = maxGap - minGap;
    const consistencyFactor = range === 0 ? 1 : Math.max(0.5, 1 - (range / minGap));
    const serverBonus = serverCount > 1 ? 1.2 : 1.0;
    const finalConfidence = Math.min(95, Math.floor(baseScore * consistencyFactor * serverBonus));

    console.log(`\n🎯 CONFIDENCE CALCULATION`);
    console.log(`   Servers with data: ${serverCount}`);
    console.log(`   Base Score (sample size): ${baseScore.toFixed(2)}%`);
    console.log(`   Consistency Factor: ${consistencyFactor.toFixed(2)}`);
    console.log(`   Server Bonus: ${serverBonus}`);
    console.log(`   Final Confidence: ${finalConfidence}%`);
}

// Fetch data and analyze
async function main() {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();

        analyzeBoss('Ocyakao', data.killDates['Ocyakao']);
        analyzeBoss('Sir Valocrest', data.killDates['Sir Valocrest']);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

main();
