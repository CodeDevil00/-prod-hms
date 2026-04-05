const express = require('express');
const router  = express.Router();
// TODO: fee routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'fee module coming soon' }));
module.exports = router;
