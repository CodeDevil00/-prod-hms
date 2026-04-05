const express = require('express');
const router  = express.Router();
// TODO: room routes — built in upcoming steps
router.get('/', (req, res) => res.json({ success: true, message: 'room module coming soon' }));
module.exports = router;
