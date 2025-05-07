const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard', adminController.dashboard);
router.get('/teachers', adminController.getAllTeachers);
router.get('/admin/students', adminController.getAllStudents);

router.get('/classes', adminController.getAllClasses);

module.exports = router;
