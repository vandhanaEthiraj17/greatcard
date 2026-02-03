require('dotenv').config({ path: '../server/.env' }); // Load env from server dir
const designService = require('../server/src/services/design.service');

async function testBrain() {
    console.log("🧠 Testing Design Intelligence Layer...");

    // Test Case 1: Simple Keyword (Fallback test or basic LLM)
    const prompt1 = "Elegant birthday card for my boss with blue and silver";
    console.log(`\n\n--- Test 1: "${prompt1}" ---`);
    try {
        const result1 = await designService.processRequest(prompt1);
        console.log("✅ Result 1:", JSON.stringify(result1, null, 2));
    } catch (e) {
        console.error("❌ Test 1 Failed:", e);
    }

    // Test Case 2: Complex Ambiguous (LLM should shine here)
    const prompt2 = "I need something for a diwali party, very traditional but golden and glowing";
    console.log(`\n\n--- Test 2: "${prompt2}" ---`);
    try {
        const result2 = await designService.processRequest(prompt2);
        console.log("✅ Result 2:", JSON.stringify(result2, null, 2));
    } catch (e) {
        console.error("❌ Test 2 Failed:", e);
    }

    // Test Case 3: Bulk-style short prompt
    const prompt3 = "Farewell";
    console.log(`\n\n--- Test 3: "${prompt3}" ---`);
    try {
        const result3 = await designService.processRequest(prompt3);
        console.log("✅ Result 3:", JSON.stringify(result3, null, 2));
    } catch (e) {
        console.error("❌ Test 3 Failed:", e);
    }
}

testBrain();
