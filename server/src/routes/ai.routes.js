const express = require('express');
const router = express.Router();
const { generateTemplate } = require('../controllers/ai.controller');

router.post('/generate-template', generateTemplate);

module.exports = router;
