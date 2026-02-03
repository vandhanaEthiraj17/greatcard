const designKnowledge = require('../config/design_knowledge.json');
const axios = require('axios');

class DesignService {
    constructor() {
        this.knowledgeBase = designKnowledge;
    }

    /**
     * 1. INTENT ANALYSIS (LLM + Fallback)
     * Extracts structured intent from text using LLM if available, else regex.
     */
    async analyzeIntent(prompt) {
        // 1. Try LLM Analysis first
        if (process.env.OPENAI_API_KEY) {
            try {
                return await this.analyzeIntentWithLLM(prompt);
            } catch (error) {
                console.error("[DesignService] LLM Analysis failed, falling back to keywords:", error.message);
                // Fallthrough to keyword analysis
            }
        }

        // 2. Keyword-based Fallback (Legacy/Offline Mode)
        return this.analyzeIntentWithKeywords(prompt);
    }

    async analyzeIntentWithLLM(prompt) {
        const systemPrompt = `
You are a Senior Creative Director and AI Design Architect.
Analyze the user's greeting card request and extract structured design intent.
Output JSON ONLY. No markdown. No chatter.

Structure:
{
  "occasion": "string (e.g., birthday, anniversary, farewell, diwali, christmas, corporate, achievement, general)",
  "style": "string (e.g., elegant, celebratory, minimal, luxury, modern, boho, festive_gold, festive_red)",
  "mood": "string (keywords like Joyful, Sophisticated, Warm)",
  "visual_elements": "string (key visual descriptions e.g., 'pastel flowers', 'gold geometry')",
  "typography_intent": "string (e.g., serif, handwritten, bold_sans)",
  "recipient_context": "string (e.g., boss, mother, friend, colleague)"
}

Map 'occasion' and 'style' to the closest match from standard design categories if possible, but allow creativity.
If specific style keywords (e.g. 'luxury', 'minimal') are found, prioritize them.
`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo if cost is concern
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10s timeout
            }
        );

        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
    }

    analyzeIntentWithKeywords(prompt) {
        const lowerPrompt = prompt.toLowerCase();

        // Detect Occasion
        let detectedOccasion = 'general';
        for (const [key, data] of Object.entries(this.knowledgeBase.occasions)) {
            if (data.keywords.some(k => lowerPrompt.includes(k))) {
                detectedOccasion = key;
                break;
            }
        }

        // Detect Style
        let detectedStyle = this.knowledgeBase.occasions[detectedOccasion]?.default_style || 'modern';
        for (const styleKey of Object.keys(this.knowledgeBase.styles)) {
            if (lowerPrompt.includes(styleKey)) {
                detectedStyle = styleKey;
                break;
            }
        }

        // Simple Extraction
        const visualRequests = prompt.replace(new RegExp(`\\b(${Object.keys(this.knowledgeBase.occasions).join('|')})\\b`, 'gi'), '').trim();

        return {
            occasion: detectedOccasion,
            style: detectedStyle,
            mood: "General",
            visual_elements: visualRequests,
            typography_intent: "auto",
            recipient_context: "general"
        };
    }

    /**
     * 2. PROMPT ENRICHMENT
     * Combines intent + design rules -> Stable Diffusion Prompt
     */
    enrichPrompt(intent) {
        // Safe match to Knowledge Base
        const safeOccasion = this.knowledgeBase.occasions[intent.occasion] ? intent.occasion : 'general';
        const occasionRules = this.knowledgeBase.occasions[safeOccasion];

        // Fallback style if LLM hallucinates a style not in DB
        const safeStyle = this.knowledgeBase.styles[intent.style] ? intent.style : (occasionRules.default_style || 'modern');
        const styleRules = this.knowledgeBase.styles[safeStyle];

        // --- A. Construct Image Gen Prompt ---
        // "Design Rules + User Visuals + Mood + Quality Boosters"

        const baseDescription = styleRules.background_description;
        const userVisuals = intent.visual_elements || "";
        const mood = intent.mood || styleRules.mood;

        // Quality Tokens
        const qualityTokens = "high quality, 8k, photorealistic, premium graphic design, elegant composition, wallpaper, no text, highly detailed, cinematic lighting";

        const imagePrompt = [
            `Background texture of ${baseDescription}`,
            userVisuals ? `incorporating ${userVisuals}` : "",
            `Mood: ${mood}`,
            `Style: ${safeStyle}`,
            qualityTokens
        ].filter(Boolean).join(', ');

        // --- B. Select Text Content ---
        // Use LLM-generated intent for nuance, or DB randoms
        const headline = occasionRules.headlines[Math.floor(Math.random() * occasionRules.headlines.length)];
        let wish = occasionRules.wishes[Math.floor(Math.random() * occasionRules.wishes.length)];

        // If recipient context is known (e.g. 'Boss'), simple logic could override or append (Future: LLM Text Gen)

        return {
            imagePrompt,
            textData: {
                headline,
                message: wish,
                footer: "Best Wishes,"
            },
            designSystem: {
                colors: styleRules.palette,
                typography: styleRules.typography,
                styleName: safeStyle
            },
            meta: {
                originalIntent: intent
            }
        };
    }

    /**
     * Main Entry Point
     */
    async processRequest(userPrompt) {
        const intent = await this.analyzeIntent(userPrompt);
        console.log("[DesignService] Analyzed Intent:", JSON.stringify(intent, null, 2));

        return this.enrichPrompt(intent);
    }
}

module.exports = new DesignService();
