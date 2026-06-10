const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/chatController');
router.use(protect);
router.post('/', ctrl.createChat);
router.get('/', ctrl.getChats);
router.get('/:id', ctrl.getChat);
router.delete('/:id', ctrl.deleteChat);
module.exports = router;
