const express = require('express');
const router = express.Router();
const { analyzePest, getHistory, deleteAnalysis } = require('../controllers/aiController');

router.post('/analyze-pest', analyzePest);
router.get('/history/:userId', getHistory);
router.delete('/:id', deleteAnalysis);

module.exports = router;
