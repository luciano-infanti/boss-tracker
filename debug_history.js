// Quick test to debug the history parsing issue
const bossName = "Yeti";
const history = "20/11/2025 (1x), 22/11/2025 (3x), 24/11/2025 (28x), 01/12/2025 (3x)";

console.log("Testing Yeti history parsing:");
console.log("History:", history);

if (!history || history === 'None') {
    console.log("History is None or empty");
} else {
    const entries = history.split(',');
    console.log("Entries:", entries);

    let total = 0;
    entries.forEach((entry, index) => {
        const trimmed = entry.trim();
        console.log(`Entry ${index}:`, trimmed);

        const match = trimmed.match(/^(\d{2}\/\d{2}\/\d{4})(?:\s*\((\d+)x\))?$/);
        console.log(`  Match:`, match);

        if (match) {
            const count = match[2] ? parseInt(match[2]) : 1;
            console.log(`  Count: ${count}`);

            const adjusted = count % 28;
            console.log(`  Adjusted (${count} % 28):`, adjusted);

            total += adjusted;
        } else {
            console.log(`  NO MATCH for: "${trimmed}"`);
        }
    });

    console.log("Total adjusted kills:", total);
}
