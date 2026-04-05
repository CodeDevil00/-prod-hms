const express = require('express');
const router  = express.Router();
// TODO: attendance routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'attendance module coming soon' }));
module.exports = router;
