const fs = require('fs');
const path = require('path');

// Mock types
const isSoulpitBoss = (name) => ['Yeti', 'Draptor', 'Midnight Panther', 'Crustacea Gigantica'].includes(name);

// Read files
const combinedPath = path.join(process.cwd(), 'data', 'ALL_WORLDS_COMBINED.txt');
const dailyPath = path.join(process.cwd(), 'data', 'daily-stats.txt');

console.log('--- DEBUGGING YETI ---');

if (fs.existsSync(combinedPath)) {
    const content = fs.readFileSync(combinedPath, 'utf8');
    const yetiBlock = content.split('---').find(r => r.includes('Boss: Yeti'));
    if (yetiBlock) {
        console.log('FOUND YETI IN COMBINED:');
        console.log(yetiBlock.trim());
    } else {
        console.log('YETI NOT FOUND IN COMBINED FILE');
    }
} else {
    console.log('COMBINED FILE NOT FOUND');
}

if (fs.existsSync(dailyPath)) {
    const content = fs.readFileSync(dailyPath, 'utf8');
    if (content.includes('Yeti')) {
        console.log('\nFOUND YETI IN DAILY STATS:');
        const lines = content.split('\n');
        const yetiLine = lines.find(l => l.includes('Yeti'));
        console.log(yetiLine ? yetiLine.trim() : 'Could not isolate line');
    } else {
        console.log('\nYETI NOT FOUND IN DAILY STATS');
    }
} else {
    console.log('DAILY FILE NOT FOUND');
}
