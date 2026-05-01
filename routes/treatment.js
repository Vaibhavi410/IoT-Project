const express = require('express');
const router = express.Router();
const {
  createTreatment,
  getTreatmentsByPest,
  getMyTreatments,
  getTreatment,
  updateTreatment,
  deleteTreatment,
} = require('../controllers/treatmentController');
const { authenticate } = require('../middleware/auth');

// All treatment routes require authentication
router.use(authenticate);

router.post('/create', createTreatment);
router.get('/my-treatments', getMyTreatments);
router.get('/pest/:pestId', getTreatmentsByPest);
router.get('/:id', getTreatment);
router.put('/:id', updateTreatment);
router.delete('/:id', deleteTreatment);

module.exports = router;
