const express = require('express');
const router  = express.Router();
// TODO: notice routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'notice module coming soon' }));
module.exports = router;
