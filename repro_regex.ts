
const strictRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s*\((\d+)x\)$/;
const flexibleRegex = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s*\((\d+)x\))?$/;

const testCases = [
    "03/12/2025 (1x)",
    "05/11/2025 (3x)",
    "03/12/2025",
    "03/12/2025(1x)",
    " 03/12/2025 (1x) ",
    "03/12/2025 (1x)" // Exact string from user
];

console.log("Testing Strict Regex:", strictRegex);
testCases.forEach(test => {
    const trimmed = test.trim();
    const match = trimmed.match(strictRegex);
    console.log(`"${test}" -> Match: ${!!match}`);
});

console.log("\nTesting Flexible Regex:", flexibleRegex);
testCases.forEach(test => {
    const trimmed = test.trim();
    const match = trimmed.match(flexibleRegex);
    console.log(`"${test}" -> Match: ${!!match}`);
});
