const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log("Attempting to connect to MongoDB...");
        // Default local URI if env not loaded, but try to load env logic if needed
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/greatcard';

        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("SUCCESS: Connected to MongoDB!");

        // Try a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("FAILED to connect:", error.message);
        process.exit(1);
    }
}

testConnection();
