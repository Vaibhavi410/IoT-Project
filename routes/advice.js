const express = require('express');
const router = express.Router();
const { getAdvice } = require('../controllers/adviceController');

router.get('/', getAdvice);

module.exports = router;

