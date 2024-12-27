const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController.js');

router.get('/api',statusController.getStatuses)

module.exports = router;