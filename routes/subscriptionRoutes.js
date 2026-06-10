const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const ctrl = require('../controllers/subscriptionController');
router.get('/me', protect, ctrl.mySubscription);
router.post('/payment-proof', protect, upload.single('screenshot'), ctrl.uploadPaymentProof);
module.exports = router;
