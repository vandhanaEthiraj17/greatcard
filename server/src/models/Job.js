const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['BULK_CSV_UPLOAD'] },
    status: { type: String, default: 'PENDING', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    failedRows: { type: Number, default: 0 },
    result: { type: Array, default: [] }, // Store generated cards if small, or reference to file
    errors: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    filePath: { type: String } // Temp file path
});

module.exports = mongoose.model('Job', JobSchema);
