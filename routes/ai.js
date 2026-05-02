const express = require('express');
const router = express.Router();
const { analyzePest } = require('../controllers/aiController');

// Public AI analyze endpoint. If you want to restrict access to authenticated users,
// replace with `router.post('/analyze', authenticate, analyzePest);` and ensure the
// frontend includes an Authorization: Bearer <token> header.
router.post('/analyze', analyzePest);

module.exports = router;
