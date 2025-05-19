const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

router.get('/announcements', commonController.getAnnouncements);

module.exports = router;