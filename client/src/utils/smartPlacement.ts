import Tesseract from 'tesseract.js';
import { EditorElement } from '../store/editorStore';

interface DetectedZone {
    text: string;
    bbox: {
        x0: number; // Left
        y0: number; // Top
        x1: number; // Right
        y1: number; // Bottom
    };
    confidence: number;
}

/**
 * Analyzes the given image URL using Tesseract.js to find text and potential fields.
 */
export const analyzeImage = async (imageUrl: string): Promise<DetectedZone[]> => {
    try {
        console.log('Starting OCR analysis...');
        const result = await Tesseract.recognize(imageUrl, 'eng', {
            // logger: m => console.log(m) // Optional: for debugging
        });

        const zones: DetectedZone[] = (result.data as any).words.map((word: any) => ({
            text: word.text.trim(),
            bbox: word.bbox,
            confidence: word.confidence
        }));

        console.log(`OCR Complete. Found ${zones.length} words.`);
        return zones;
    } catch (error) {
        console.error('OCR Failed:', error);
        return [];
    }
};

/**
 * Calculates new positions for elements based on detected zones.
 * Matches elements to zones based on simple keyword heuristics.
 */
export const calculatePositions = (zones: DetectedZone[], elements: EditorElement[]): Partial<EditorElement>[] => {
    const updates: Partial<EditorElement>[] = [];

    // Helper: Find a zone that matches a keyword
    const findZone = (keywords: string[]) => {
        return zones.find(z =>
            keywords.some(k => z.text.toLowerCase().includes(k.toLowerCase()))
        );
    };

    // Helper: Find a "line" or "underscore" nearby a label
    // Simplified: Just looks for underscores for now
    const underscores = zones.filter(z => z.text.includes('_') || z.text.includes('.....'));

    elements.forEach(el => {
        let matchedZone: DetectedZone | undefined;

        // Logic for Text Elements
        if (el.type === 'text') {
            const content = (el.placeholderKey || el.text || '').toLowerCase();

            if (content.includes('name') || content.includes('recipient')) {
                matchedZone = findZone(['Name', 'Recipient', 'To:']);
            } else if (content.includes('date')) {
                matchedZone = findZone(['Date', 'On:']);
            } else if (content.includes('position') || content.includes('role')) {
                matchedZone = findZone(['Position', 'Role', 'Title']);
            }
        }

        // Logic for Image Elements (Logo)
        if (el.type === 'image') {
            matchedZone = findZone(['Logo', 'Icon', 'Brand']);
        }

        if (matchedZone) {
            // If we found a label (e.g., "Name:"), we often want to put the text *next to* or *below* it.
            // Or if we found an underscore line, we put it *on* the line.

            // 1. Check if there's an underscore line to the right of the label
            const nearbyLine = underscores.find(u =>
                u.bbox.x0 > matchedZone!.bbox.x0 && // To the right
                Math.abs(u.bbox.y0 - matchedZone!.bbox.y0) < 50 // Roughly same vertical line
            );

            let targetX = matchedZone.bbox.x0;
            let targetY = matchedZone.bbox.y0;

            if (nearbyLine) {
                // Center on the line
                targetX = nearbyLine.bbox.x0; // Start of line
                targetY = nearbyLine.bbox.y0 - 10; // Slightly above line
            } else {
                // No line? Put it below the label
                targetX = matchedZone.bbox.x0;
                targetY = matchedZone.bbox.y1 + 10; // Below label
            }

            updates.push({
                id: el.id,
                x: targetX,
                y: targetY
            });
        }
    });

    return updates;
};
