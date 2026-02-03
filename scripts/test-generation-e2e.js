require('dotenv').config({ path: '../server/.env' });
const aiService = require('../server/src/services/ai.service');
const path = require('path');
const fs = require('fs');

async function testEndToEnd() {
    console.log("🚀 Testing End-to-End Generation (Design + AI + Image)...");

    const testPrompt = "Luxury golden anniversary card for my parents";

    // Ensure storage exists
    const storageDir = path.join(__dirname, '../storage/generated');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }

    try {
        console.log(`\nInput Prompt: "${testPrompt}"`);
        // Force UNLOCKED mode to trigger AI background generation
        const paths = await aiService.generateTemplate(null, testPrompt, 1, 'UNLOCKED');

        console.log("\n✅ Generation Success!");
        console.log("Generated Files:", paths);

        // simple validation
        if (paths.length > 0 && typeof paths[0] === 'string') {
            console.log("✅ Output path format is correct.");
        } else {
            console.error("❌ Output path format is invalid.");
        }

    } catch (error) {
        console.error("❌ Generation Failed:", error);
    }
}

testEndToEnd();
