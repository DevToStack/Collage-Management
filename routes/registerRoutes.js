const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registerController');

router.post('/register', registrationController.registerCollege);

module.exports = router;
