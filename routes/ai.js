const express = require('express');
const router = express.Router();
const { analyzePest } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// Protect AI route if you want only authenticated users to call it.
// If you prefer public access (not recommended), remove `authenticate`.
router.post('/analyze', authenticate, analyzePest);

module.exports = router;
