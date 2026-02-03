const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bulkController = require('../controllers/bulk.controller');

// Configure Multer for CSV Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../storage/uploads');
        // Ensure dir exists
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        cb(null, `bulk-${Date.now()}.csv`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB Limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Strict MIME type checking
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
        if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    }
});

const ensureServicesReady = require('../middlewares/serviceGuard.middleware');

// @route   POST /api/bulk/generate
// @desc    Process bulk CSV upload
// @access  Public
router.post('/generate', ensureServicesReady, upload.single('file'), bulkController.processBulkUpload);

// @route   GET /api/bulk/status/:id
// @desc    Get bulk job status
// @access  Public
router.get('/status/:id', bulkController.getJobStatus);

module.exports = router;
