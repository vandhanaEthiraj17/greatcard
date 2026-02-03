// server/src/services/imagen.service.js
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');

class ImagenService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID;
        this.location = 'us-central1'; // Default Vertex AI location
        // Initialize Vertex AI if credentials exist
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS && this.projectId) {
            try {
                this.vertexAI = new VertexAI({ project: this.projectId, location: this.location });
                this.model = this.vertexAI.preview.getGenerativeModel({
                    model: 'imagegeneration@005', // Current Imagen 2 model
                });
                console.log("[Imagen Service] Initialized Google Vertex AI.");
            } catch (e) {
                console.warn("[Imagen Service] Failed to init Vertex AI:", e.message);
            }
        }
    }

    /**
     * Primary Generation Function
     * @param {string} prompt - The enriched visual prompt from LLM
     * @returns {Promise<Buffer>} - Image buffer
     */
    async generate(prompt) {
        console.log(`[Imagen Service] Requesting Art: "${prompt.substring(0, 50)}..."`);

        // 1. Mock Mode (Fast Dev Loop)
        if (process.env.MOCK_IMAGEN === 'true') {
            console.log("[Imagen Service] MOCK MODE: Returning placeholder.");
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            await delay(1000);
            throw new Error("MOCK_IMAGEN_FALLBACK_TEST"); // Throwing to test fallback, or return solid color
        }

        // 2. Check Readiness
        if (!this.model) {
            console.warn("[Imagen Service] Not configured. Throwing to fallback.");
            throw new Error("IMAGEN_NOT_CONFIGURED");
        }

        try {
            // 3. Call Google Vertex AI
            const response = await this.model.generateImages({
                prompt: prompt,
                numberOfImages: 1,
                aspectRatio: '1:1', // Square for cards
                safetySettings: [], // Enterprise requires explicit safety config usually
                personGeneration: 'allow_adult', // Example config
            });

            if (response.images && response.images.length > 0) {
                // Imagen returns Base64
                const base64Image = response.images[0];
                const buffer = Buffer.from(base64Image, 'base64');
                console.log("[Imagen Service] Generation Successful.");
                return buffer;
            } else {
                throw new Error("No image returned from Vertex AI");
            }

        } catch (error) {
            console.error("[Imagen Service] Generation Failed:", error.message);
            throw new Error(`IMAGEN_API_ERROR: ${error.message}`);
        }
    }
}

module.exports = new ImagenService();
