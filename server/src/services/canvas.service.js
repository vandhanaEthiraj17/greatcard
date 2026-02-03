// server/src/services/canvas.service.js
const sharp = require('sharp');
const path = require('path');

class CanvasService {

    /**
     * Composites text onto the background image.
     * @param {Buffer} backgroundBuffer - The generated or template image
     * @param {Object} context - The standardized Design Context from LLM
     * @param {string} outputPath - Where to save the file
     */
    async composite(backgroundBuffer, context, outputPath) {
        console.log("[Canvas Service] Typesetting and Compositing...");

        const metadata = await sharp(backgroundBuffer).metadata();
        const width = metadata.width || 1080;
        const height = metadata.height || 1080;

        const svgOverlay = this.createSVGOverlay(context, width, height);

        await sharp(backgroundBuffer)
            .composite([{
                input: Buffer.from(svgOverlay),
                top: 0,
                left: 0,
            }])
            .toFile(outputPath);

        console.log(`[Canvas Service] Rendered to: ${outputPath}`);
        return outputPath;
    }

    createSVGOverlay(context, width, height) {
        const { text, design } = context;

        // Typography Logic
        // In a real app, we'd load actual font files. 
        // For SVG, we rely on system agnostic stacks or Google Fonts if we could embed them, 
        // but simple strings work for Server-side SVG rendering if fonts are installed.
        // We'll stick to websafe-ish stacks or generic family names that Sharp/rsvg can handle.
        const fontStack = design.typography.toLowerCase().includes('serif')
            ? "'Georgia', 'Times New Roman', serif"
            : "'Arial', 'Helvetica', sans-serif";

        const isScript = design.typography.toLowerCase().includes('script');
        const headlineFont = isScript ? "'Brush Script MT', 'cursive'" : fontStack;

        // Sizing Math (Responsive to image size)
        const headlineSize = Math.floor(width / 10);
        const bodySize = Math.floor(width / 24);
        const footerSize = Math.floor(width / 40);

        // XML Escape helper
        const escape = (str) => (str || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Text Wrapping (Naive implementation for SVG)
        // A robust system would use a canvas measurement or foreignObject with HTML/CSS.
        // For this demo, we split by newline or word count chunks if needed. 
        // We'll assume the LLM generates concise standard lines.
        const message = text.body || "";
        // rudimentary wrap: split roughly every 40 chars
        const wrapText = (txt) => {
            const words = txt.split(' ');
            let lines = [];
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                if (currentLine.length + 1 + words[i].length < 35) {
                    currentLine += " " + words[i];
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);
            return lines;
        };

        const messageLines = wrapText(message);
        const renderedMessage = messageLines.map((line, i) =>
            `<tspan x="50%" dy="${i === 0 ? '0' : '1.3em'}">${escape(line)}</tspan>`
        ).join('');

        return `
        <svg width="${width}" height="${height}">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="black" flood-opacity="0.6"/>
            </filter>
          </defs>
          <style>
            .headline { 
                fill: ${design.accentColor || '#D4AF37'}; 
                font-family: ${headlineFont}; 
                font-weight: 800; 
                font-size: ${headlineSize}px; 
                filter: url(#shadow);
                text-transform: ${isScript ? 'none' : 'uppercase'};
                letter-spacing: ${isScript ? '0' : '0.1em'};
            }
            .message { 
                fill: ${design.textColor || '#FFFFFF'}; 
                font-family: ${fontStack}; 
                font-weight: 500; 
                font-size: ${bodySize}px; 
                opacity: 0.95;
                filter: url(#shadow);
            }
            .footer {
                fill: ${design.textColor || '#FFFFFF'};
                font-family: ${fontStack}; 
                font-style: italic;
                font-size: ${footerSize}px;
                opacity: 0.8;
                filter: url(#shadow);
            }
          </style>
          
          <!-- Headlines can be multi-line too but let's assume short -->
          <text x="50%" y="25%" text-anchor="middle" class="headline">${escape(text.headline)}</text>
          
          <text x="50%" y="50%" text-anchor="middle" class="message">
            ${renderedMessage}
          </text>

          <text x="50%" y="85%" text-anchor="middle" class="footer">${escape(text.footer)}</text>
        </svg>
        `;
    }
    /**
     * Composites generic layers (from Visual Editor) onto background.
     * @param {Buffer} backgroundBuffer 
     * @param {Array} layers - [{ type: 'text', content, x, y, style: { font, size, color, align } }]
     * @param {string} outputPath 
     */
    async compositeLayers(backgroundBuffer, layers, outputPath) {
        console.log("[Canvas Service] Compositing Generic Layers...");

        const metadata = await sharp(backgroundBuffer).metadata();
        const width = metadata.width || 1080;
        const height = metadata.height || 1080;

        const svgOverlay = this.createGenericSVGOverlay(layers, width, height);

        await sharp(backgroundBuffer)
            .composite([{
                input: Buffer.from(svgOverlay),
                top: 0,
                left: 0,
            }])
            .toFile(outputPath);

        console.log(`[Canvas Service] Rendered to: ${outputPath}`);
        return outputPath;
    }

    createGenericSVGOverlay(layers, width, height) {
        const escape = (str) => (str || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const svgContent = layers.map(layer => {
            if (layer.type === 'text') {
                const fontSize = layer.style?.size || 40;
                const fontFamily = layer.style?.font || 'Arial';
                const fill = layer.style?.color || '#000000';
                const textAnchor = layer.style?.align === 'center' ? 'middle' : (layer.style?.align === 'right' ? 'end' : 'start');

                // Naive approximation: Konva uses top-left, SVG text uses baseline. 
                // We add approximate cap-height (fontSize) to y to align somewhat correctly.
                const adjustedY = (layer.y || 0) + (fontSize * 0.8);

                return `<text x="${layer.x}" y="${adjustedY}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}" text-anchor="${textAnchor}">${escape(layer.content)}</text>`;
            }
            return '';
        }).join('\n');

        return `
        <svg width="${width}" height="${height}">
           ${svgContent}
        </svg>
        `;
    }
}

module.exports = new CanvasService();
