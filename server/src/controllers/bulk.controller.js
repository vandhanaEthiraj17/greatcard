const fs = require('fs');
const path = require('path');
const { csvUploadQueue } = require('../config/queue');
const Job = require('../models/Job');

// @desc    Process Bulk CSV (Async)
// @route   POST /api/bulk/generate
// @access  Public
exports.processBulkUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CSV file.' });
        }

        console.log(`[Bulk API] Received file: ${req.file.path}`);

        // 1. Create Job Record
        const job = new Job({
            type: 'BULK_CSV_UPLOAD',
            status: 'PENDING',
            filePath: req.file.path,
            createdAt: new Date()
        });
        await job.save();

        // 2. Add to Queue
        await csvUploadQueue.add('process-csv', {
            jobId: job._id,
            filePath: req.file.path
        });

        // 3. Return Success Immediately
        res.status(202).json({
            success: true,
            jobId: job._id,
            message: "File uploaded successfully. Processing started.",
            statusUrl: `/api/bulk/status/${job._id}` // Suggesting a status endpoint
        });

    } catch (error) {
        console.error('[Bulk API] Upload Error:', error);
        // Clean up file if job creation failed
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }

        res.status(500).json({
            success: false,
            message: 'Internal Server Error during upload initialization.'
        });
    }
};

// @desc    Get Job Status
// @route   GET /api/bulk/status/:id
exports.getJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
