const designKnowledge = require('../config/design_knowledge.json');
const axios = require('axios');

class LLMService {
    constructor() {
        this.knowledgeBase = designKnowledge;
    }

    /**
     * CORE BRAIN FUNCTION
     * Input: User Prompt (e.g., "Birthday card for mom")
     * Output: Structured Design Context (JSON)
     */
    async analyze(prompt) {
        console.log(`[LLM Service] Thinking about: "${prompt}"`);

        let intent;

        // 1. Try LLM Intelligence
        if (process.env.OPENAI_API_KEY) {
            try {
                intent = await this.enrichWithLLM(prompt);
            } catch (error) {
                console.error("[LLM Service] Brain Freeze (API Error). Switching to Reflexes (Fallback).", error.message);
                intent = this.fallbackAnalysis(prompt);
            }
        } else {
            console.log("[LLM Service] No API Key. Using Reflexes (Fallback).");
            intent = this.fallbackAnalysis(prompt);
        }

        // 2. Standardize Output
        return this.standardizeContext(intent, prompt);
    }

    async enrichWithLLM(prompt) {
        const systemPrompt = `
You are a Senior Creative Director and Copywriter for a luxury greeting card brand.
Your goal is to take a simple user request and expand it into a premium design specification.

1.  **Analyze Intent**: Understand occasion, recipient, and implicit mood.
2.  **Generate Copy**: Write a short, elegant, refined greeting message. Avoid cheesy, generic clichés. Use proper punctuation.
3.  **Visual Direction**: Describe a premium background image for a generative AI (Imagen/Stable Diffusion). Focus on texture, lighting, color, and composition. No text in image description.
4.  **Typography**: Suggest font styles (Serif, Sans, Script) and colors.

Output JSON ONLY:
{
  "occasion": "string",
  "style": "string (Luxury, Minimal, Elegant, Festive, Corporate)",
  "greeting_headline": "string (Short, e.g. Happy Birthday)",
  "greeting_body": "string (Elegant message, max 2 sentences)",
  "visual_prompt": "string (Detailed image generation prompt, e.g. 'Gold foil texture on black silk, soft bokeh...')",
  "typography_style": "string (serif|sans|script)",
  "color_palette_hex": "string (e.g. #FFD700)",
  "text_color_hex": "string (e.g. #FFFFFF)"
}
`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4-turbo-preview", // High intelligence model
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
                timeout: 15000
            }
        );

        return JSON.parse(response.data.choices[0].message.content);
    }

    fallbackAnalysis(prompt) {
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

        const styleRules = this.knowledgeBase.styles[detectedStyle];
        const occasionRules = this.knowledgeBase.occasions[detectedOccasion];

        // Randomly select copy
        const headline = occasionRules.headlines[Math.floor(Math.random() * occasionRules.headlines.length)];
        const body = occasionRules.wishes[Math.floor(Math.random() * occasionRules.wishes.length)];

        // Construct Visual Prompt
        const visualRequests = prompt.replace(new RegExp(`\\b(${Object.keys(this.knowledgeBase.occasions).join('|')})\\b`, 'gi'), '').trim();
        const visualPrompt = [
            styleRules.background_description,
            visualRequests,
            `Mood: ${styleRules.mood}`,
            "high quality, 8k, wallpaper, no text"
        ].filter(Boolean).join(', ');

        return {
            occasion: detectedOccasion,
            style: detectedStyle,
            greeting_headline: headline,
            greeting_body: body,
            visual_prompt: visualPrompt,
            typography_style: styleRules.typography.headline,
            color_palette_hex: styleRules.palette.accent,
            text_color_hex: styleRules.palette.text_contrast === 'light' ? '#FFFFFF' : '#000000'
        };
    }

    // Ensure the output format is consistent for the next steps
    standardizeContext(intent, originalPrompt) {
        return {
            meta: {
                originalPrompt,
                occasion: intent.occasion,
                style: intent.style
            },
            text: {
                headline: intent.greeting_headline,
                body: intent.greeting_body,
                footer: "Best Wishes,"
            },
            visual: {
                prompt: intent.visual_prompt, // The "Enriched" prompt for Imagen/SD
                style: intent.style
            },
            design: {
                typography: intent.typography_style,
                accentColor: intent.color_palette_hex,
                textColor: intent.text_color_hex
            }
        };
    }
}

module.exports = new LLMService();
