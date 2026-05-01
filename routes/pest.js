const express = require('express');
const router = express.Router();
const {
  createPestAnalysis,
  getPestHistory,
  getPestAnalysis,
  updatePestAnalysis,
  deletePestAnalysis,
} = require('../controllers/pestController');
const { authenticate } = require('../middleware/auth');

// All pest routes require authentication
router.use(authenticate);

router.post('/analyze', createPestAnalysis);
router.get('/history', getPestHistory);
router.get('/:id', getPestAnalysis);
router.put('/:id', updatePestAnalysis);
router.delete('/:id', deletePestAnalysis);

module.exports = router;
