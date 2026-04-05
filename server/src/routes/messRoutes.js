const express = require('express');
const router  = express.Router();
// TODO: mess routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'mess module coming soon' }));
module.exports = router;
