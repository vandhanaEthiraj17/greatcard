const Template = require('../models/Template.model');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: templates.length, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Upload a template (Metadata only, file handled by middleware)
// @route   POST /api/templates
// @access  Public
exports.createTemplate = async (req, res) => {
    try {
        console.log("Create Template Request:", req.body, req.file); // Debug log

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded or file rejected by filter.' });
        }

        const { name, type, aspectRatio } = req.body;

        const template = await Template.create({
            name: name || req.file.originalname,
            type: type || 'UPLOAD',
            aspectRatio: aspectRatio || '16:9',
            filePath: `/storage/uploads/${req.file.filename}`,
            previewPath: `/storage/uploads/${req.file.filename}` // For uploaded images, preview is same as file
        });

        res.status(201).json({ success: true, data: template });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update template layout
// @route   PUT /api/templates/:id/layout
// @access  Public
exports.updateLayout = async (req, res) => {
    try {
        const { layout } = req.body;

        if (!layout) {
            return res.status(400).json({ success: false, message: 'No layout data provided' });
        }

        const template = await Template.findByIdAndUpdate(
            req.params.id,
            { layout },
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        res.status(200).json({ success: true, data: template });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
