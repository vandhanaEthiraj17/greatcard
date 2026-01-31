const aiService = require('../services/ai.service');
const Template = require('../models/Template.model'); // Import Template Model

// @desc    Generate a new AI Template
// @route   POST /api/ai/generate-template
// @access  Public
exports.generateTemplate = async (req, res) => {
    try {
        const { prompt, count = 4, templateId, templateMode = 'LOCKED' } = req.body;

        // Validation
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid text prompt is required.'
            });
        }

        let absoluteTemplatePath = null;

        if (templateId) {
            // Fetch Template
            const template = await Template.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template file not found on server.'
                });
            }

            // Call Service with Template Path
            // We need the absolute path on disk
            const path = require('path');
            // template.filePath is relative like "/storage/uploads/..."
            // We need to resolve it relative to server root or absolute.
            // Assuming server run from 'server/' and storage is '../storage'
            const relativePath = template.filePath.startsWith('/') ? template.filePath.slice(1) : template.filePath; // remove leading slash
            absoluteTemplatePath = path.join(__dirname, '../../../', relativePath);
        }

        const imagePaths = await aiService.generateTemplate(absoluteTemplatePath, prompt, count, templateMode);

        // Map paths to full URLs
        const templates = imagePaths.map((path, index) => ({
            id: index + 1,
            imageUrl: `http://localhost:5001/${path}`
        }));

        // Success Response
        res.status(200).json({
            success: true,
            templates: templates
        });

    } catch (error) {
        console.error('AI ENGINE ERROR:', error);

        // Return standard error format
        res.status(503).json({
            success: false,
            message: error.message || 'AI engine unavailable or failed'
        });
    }
};
