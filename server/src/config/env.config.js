const dotenv = require('dotenv');
const path = require('path');

// Load .env from root of server
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5001,

    // Infrastructure
    MONGO_URI: process.env.MONGO_URI,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,

    // AI Keys
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
    // Google creds usually handled by the SDK via GOOGLE_APPLICATION_CREDENTIALS path

    // Feature Flags
    MOCK_IMAGEN: process.env.MOCK_IMAGEN === 'true',
};

const validate = () => {
    const missing = [];

    // Critical Infrastructure - Must Crash if missing
    if (!config.MONGO_URI) missing.push('MONGO_URI');

    if (missing.length > 0) {
        console.error("❌ CRITICAL CONFIG ERROR: Missing required environment variables:");
        missing.forEach(k => console.error(`   - ${k}`));
        process.exit(1);
    }

    // AI Services - Degraded Mode Warning
    if (!config.OPENAI_API_KEY) {
        console.warn("⚠️  WARNING: OPENAI_API_KEY is missing. 'The Brain' will run in Keyword Fallback mode.");
    }
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !config.MOCK_IMAGEN) {
        console.warn("⚠️  WARNING: GOOGLE_APPLICATION_CREDENTIALS missing. 'The Artist' will use Stable Diffusion Fallback.");
    }
};

validate();

module.exports = config;
