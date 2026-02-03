// server/src/services/stableDiffusion.service.js
const axios = require('axios');

class StableDiffusionService {

    /**
     * Fallback Generation Function
     * @param {string} prompt - The enriched visual prompt
     * @returns {Promise<Buffer>} - Image buffer
     */
    async generate(prompt) {
        console.log(`[SD Service] Fallback Activated. Generating: "${prompt.substring(0, 50)}..."`);

        try {
            // Use Pollinations.ai as a reliable, free SD provider for the backup
            // In a real enterprise env, this would point to a self-hosted SD XL instance
            const seed = Math.floor(Math.random() * 100000);
            const encodedPrompt = encodeURIComponent(prompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true&seed=${seed}&model=flux`; // using 'flux' or 'turbo' if available, defaulting to standard

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000 // 30s timeout
            });

            console.log("[SD Service] Generation Successful.");
            return Buffer.from(response.data);

        } catch (error) {
            console.warn(`[SD Service] External API Failed: ${error.message}. Switching to Solid Color Fallback.`);
            // TERTIARY FALLBACK: Solid Color Canvas
            // Real enterprise systems might have a local SD running, but for this demo, 
            // we ensure the pipeline NEVER crashes by returning a valid image buffer.
            const sharp = require('sharp');
            // Extract a color from prompt or default to light grey
            const color = prompt.includes('dark') ? '#1f2937' : '#f3f4f6';

            return await sharp({
                create: {
                    width: 1080,
                    height: 1080,
                    channels: 4,
                    background: color
                }
            }).png().toBuffer();
        }
    }
}

module.exports = new StableDiffusionService();
