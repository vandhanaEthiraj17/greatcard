const mongoose = require('mongoose');
const GeneratedCard = require('../server/src/models/GeneratedCard.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function verifyAudit() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/greatcard';
        await mongoose.connect(uri);
        console.log(`Connected to DB: ${uri}`);

        const cards = await GeneratedCard.find().sort({ createdAt: -1 }).limit(3);

        console.log("\n=== AUDIT VERIFICATION ===");
        cards.forEach(card => {
            console.log(`Card ID: ${card._id}`);
            console.log(`Recipient: ${card.recipientData.name}`);
            console.log(`AI Engine: ${card.ai_audit?.engine}`);
            console.log(`Fallback Triggered: ${card.ai_audit?.fallback_triggered}`);
            console.log(`Duration: ${card.ai_audit?.generation_time_ms}ms`);
            console.log("--------------------------");
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyAudit();
