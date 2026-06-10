const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage } = require('../controllers/aiController');
router.post('/chat', protect, sendMessage);
module.exports = router;
