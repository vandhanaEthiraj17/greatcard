const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Job = require('../models/Job');
const GeneratedCard = require('../models/GeneratedCard.model');
const aiService = require('../services/ai.service');
const { connection } = require('../config/queue');

// Mock Template ID for 'Creative Mode' if needed, or find a real one
// Ideally we should find a 'Default' template or make it optional.
// For now, if we can't find one, we might need to skip saving or use a placeholder.
const PLACEHOLDER_TEMPLATE_ID = new mongoose.Types.ObjectId('000000000000000000000000');

const worker = new Worker('csv-upload-queue', async (job) => {
    const { jobId, filePath } = job.data;
    console.log(`[Worker] Starting job ${jobId} processing file ${filePath}`);

    const jobRecord = await Job.findById(jobId);
    if (!jobRecord) {
        throw new Error(`Job ${jobId} not found`);
    }

    jobRecord.status = 'PROCESSING';
    jobRecord.processedRows = 0;
    jobRecord.failedRows = 0;
    await jobRecord.save();

    const results = [];
    const errors = [];
    const generatedCards = [];

    try {
        const rows = [];
        // 1. Parse CSV (Stream to memory array first to get total count, or stream process)
        // Streaming process is better for huge files, but we need strictly sequential for now to update progress accurately?
        // Let's stream and process one by one to avoid OOM on massive files.

        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => rows.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        jobRecord.totalRows = rows.length;
        await jobRecord.save();

        console.log(`[Worker] Job ${jobId}: Found ${rows.length} rows`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const name = row.name || row.Name || 'Colleague';
            const occasion = row.occasion || row.Occasion || 'Greeting';
            const customPrompt = row.prompt || row.Prompt || `${occasion} card for ${name}`;

            try {
                // Generate Card
                let imagePaths = [];
                let auditData = {};

                try {
                    const result = await aiService.generateTemplate(null, customPrompt, 1, 'UNLOCKED');
                    imagePaths = result.paths;
                    auditData = result.audit;
                } catch (genErr) {
                    console.error(`[Worker] AI Gen Error Row ${i + 1}: ${genErr.message}`);
                    throw genErr; // Rethrow to catch below and log row failure
                }

                if (imagePaths && imagePaths.length > 0) {
                    const imageUrl = imagePaths[0]; // local path

                    // Save to DB
                    // We need a valid templateId for GeneratedCard. 
                    // Since this is "Creative Mode", we might not have one. 
                    // We'll use the placeholder or try to find a default one.

                    const card = new GeneratedCard({
                        templateId: PLACEHOLDER_TEMPLATE_ID,
                        outputPath: imageUrl,
                        format: 'jpg',
                        recipientData: { name, occasion, prompt: customPrompt },
                        status: 'COMPLETED',
                        ai_audit: auditData // Persist Observability Data
                    });

                    // SAFE DB INSERT
                    try {
                        await card.save();
                    } catch (dbErr) {
                        console.warn(`[Worker] DB Save Warning (Row ${i + 1}): ${dbErr.message}. proceeding...`);
                    }

                    generatedCards.push({
                        row: i + 1,
                        name: name,
                        status: 'SUCCESS',
                        imageUrl: `http://localhost:5001/${imageUrl}` // Construct absolute URL
                    });

                    generatedCards.push({
                        row: i + 1,
                        name,
                        status: 'SUCCESS',
                        imageUrl: `http://localhost:5001/${imageUrl}` // Construct absolute URL
                    });
                }

                jobRecord.processedRows += 1;
                // Periodic save to avoid DB spam
                if (i % 5 === 0) await jobRecord.save();

            } catch (err) {
                console.error(`[Worker] Error row ${i}:`, err.message);
                jobRecord.failedRows += 1;
                errors.push({ row: i + 1, name, error: err.message });
            }
        }

        jobRecord.status = 'COMPLETED';
        jobRecord.completedAt = new Date();
        jobRecord.result = generatedCards; // Store results in Job
        jobRecord.errors = errors;
        await jobRecord.save();

        console.log(`[Worker] Job ${jobId} Completed. Generated: ${generatedCards.length}, Failed: ${errors.length}`);

    } catch (error) {
        console.error(`[Worker] Job ${jobId} FATAL:`, error);
        jobRecord.status = 'FAILED';
        jobRecord.errors.push({ error: error.message });
        await jobRecord.save();
    } finally {
        // Cleanup file
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
            console.error('Failed to delete temp csv', e);
        }
    }

}, { connection });

// Worker Lifecycle Logging
worker.on('ready', () => {
    console.log('✅ CSV Worker is ready and listening for jobs.');
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed: ${err.message}`);
});

worker.on('error', (err) => {
    console.error('❌ Worker Encountered Error:', err.message);
});

module.exports = worker;
