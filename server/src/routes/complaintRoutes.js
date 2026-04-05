const express = require('express');
const router  = express.Router();
// TODO: complaint routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'complaint module coming soon' }));
module.exports = router;
