require('dotenv').config({ path: '../server/.env' });
const aiService = require('../server/src/services/ai.service');

async function testPipeline() {
    console.log("🏭 Testing Enterprise Pipeline...");

    // Test Prompt
    const prompt = "Corporate thank you card for our partnership";

    console.log(`\nInput: "${prompt}"`);
    console.log("Expecting: LLM Analysis -> Imagen (Fail) -> SD (Success) -> Canvas -> File");

    try {
        const results = await aiService.generateTemplate(null, prompt, 1, 'UNLOCKED');
        console.log("\n✅ Pipeline Result:", results);
    } catch (e) {
        console.error("\n❌ Pipeline Failed:", e);
    }
}

testPipeline();
