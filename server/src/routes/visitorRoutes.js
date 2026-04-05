const express = require('express');
const router  = express.Router();
// TODO: visitor routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'visitor module coming soon' }));
module.exports = router;
