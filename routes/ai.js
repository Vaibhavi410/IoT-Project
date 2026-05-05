const express = require('express');
const router = express.Router();
const {
  analyzePest,
  getHistory,
  getStats,
  chatAssistant,
  deleteAnalysis,
} = require('../controllers/aiController');

router.post('/analyze-pest', analyzePest);
router.get('/history/:userId', getHistory);
router.get('/stats/:userId', getStats);
router.post('/chat', chatAssistant);
router.delete('/:id', deleteAnalysis);

module.exports = router;
