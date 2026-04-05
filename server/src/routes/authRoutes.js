const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/login',    controller.login);
router.get('/me',        protect, controller.getMe);
router.post('/register', protect, restrictTo('Admin'), controller.register);

module.exports = router;
