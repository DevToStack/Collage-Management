const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registerController');

router.post('/register/college', registrationController.registerCollege);
router.post('/register/teacher', registrationController.registerTeacher);

module.exports = router;
