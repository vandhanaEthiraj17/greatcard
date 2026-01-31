const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class AIService {
    /**
     * Generate templated images using Sharp overlay
     * @param {string|null} templatePath - Absolute path to the source template (if Locked Mode)
     * @param {string} prompt - User intent/prompt
     * @param {number} count - Number of variations
     */
    async generateTemplate(templatePath, prompt, count = 4) {
        try {
            console.log(`[AI Service] Processing... Mode: ${templatePath ? 'LOCKED' : 'CREATIVE'}`);
            console.log(`[AI Service] User Prompt: ${prompt}`);

            // Ensure output directory exists
            const outputDir = path.join(__dirname, '../../../storage/generated');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // --- 1. Intelligence Layer (Mock LLM) ---
            // In a real app, this would be a call to GPT-4o returning JSON.
            const intelligence = this.inferDesignIntent(prompt);
            console.log("[AI Service] Intelligence Generated:", intelligence);

            const generatedPaths = [];

            for (let i = 0; i < count; i++) {
                const filename = `smart-gen-${Date.now()}-${i}.jpg`;
                const outputPath = path.join(outputDir, filename);

                // --- 2. Background Handling ---
                let backgroundBuffer;
                let width = 1080;
                let height = 1080;

                if (templatePath) {
                    // LOCKED MODE: Use uploaded file
                    backgroundBuffer = templatePath; // Sharp accepts path string
                    const metadata = await sharp(templatePath).metadata();
                    width = metadata.width || 1080;
                    height = metadata.height || 1080;
                } else {
                    // CREATIVE MODE: Generate default background
                    // Variation: Different colors for each iteration if creative
                    const bgColors = ['#f3f4f6', '#e0f2fe', '#fef3c7', '#fee2e2'];
                    const bgColor = bgColors[i % bgColors.length];

                    backgroundBuffer = await sharp({
                        create: {
                            width: 1080,
                            height: 1080,
                            channels: 4,
                            background: bgColor
                        }
                    })
                        .png()
                        .toBuffer();
                }

                // --- 3. Rendering Layer ---
                // Create SVG overlay based on Intelligence + Dimensions
                const svgOverlay = this.createSVGOverlay(intelligence, width, height, i);

                await sharp(backgroundBuffer)
                    .composite([{
                        input: Buffer.from(svgOverlay),
                        top: 0,
                        left: 0,
                    }])
                    .toFile(outputPath);

                console.log(`[AI Service] Generated: ${outputPath}`);
                generatedPaths.push(`storage/generated/${filename}`);
            }

            return generatedPaths;

        } catch (error) {
            console.error('[AI Service] Generation Failed:', error);
            throw new Error(`Smart Generation Error: ${error.message}`);
        }
    }

    // Mock Intelligence Function
    inferDesignIntent(prompt) {
        const lowerPrompt = prompt.toLowerCase();

        let occasion = "Greeting";
        let headline = "Best Wishes";
        let message = "Wishing you a wonderful day!";
        let tone = "Warm";
        let color = "#1f2937"; // Gray-900

        if (lowerPrompt.includes('birthday')) {
            occasion = "Birthday";
            headline = "Happy Birthday!";
            message = "Wishing you joy, laughter, and a fantastic year ahead.";
            color = "#be185d"; // Pink-700
        } else if (lowerPrompt.includes('anniversary')) {
            occasion = "Anniversary";
            headline = "Happy Anniversary";
            message = "Celebrating another year of success and partnership.";
            color = "#b45309"; // Amber-700
        } else if (lowerPrompt.includes('diwali')) {
            occasion = "Diwali";
            headline = "Happy Diwali";
            message = "May the festival of lights bring you prosperity and peace.";
            color = "#c2410c"; // Orange-700
        } else if (lowerPrompt.includes('hiring') || lowerPrompt.includes('welcome')) {
            occasion = "Welcome";
            headline = "Welcome Aboard";
            message = "We are thrilled to have you on the team!";
            color = "#1d4ed8"; // Blue-700
        }

        return { occasion, headline, message, tone, color };
    }

    // Helper to Create SVG from Intelligence Data
    createSVGOverlay(data, width, height, variationIndex) {
        // Simple responsive scaling
        const headlineSize = Math.floor(width / 12);
        const messageSize = Math.floor(width / 24);

        // Use variationIndex to slightly shift color from base palette
        const colors = [data.color, '#000000', '#3730a3', '#991b1b'];
        const finalColor = colors[variationIndex % colors.length];

        // Safe XML escaping for text
        const escape = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeHeadline = escape(data.headline);
        const safeMessage = escape(data.message);

        return `
        <svg width="${width}" height="${height}">
          <style>
            .headline { fill: ${finalColor}; font-family: sans-serif; font-weight: bold; font-size: ${headlineSize}px; }
            .message { fill: ${finalColor}; font-family: sans-serif; font-size: ${messageSize}px; opacity: 0.8; }
          </style>
          
          <text x="50%" y="45%" text-anchor="middle" class="headline">${safeHeadline}</text>
          <text x="50%" y="55%" text-anchor="middle" class="message" dy="1.2em">${safeMessage}</text>
        </svg>
        `;
    }
}

module.exports = new AIService();
