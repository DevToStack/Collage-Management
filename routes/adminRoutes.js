const express = require('express');
const { authenticate } = require('../middleware/auth');  // Destructure here
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard', authenticate, adminController.dashboard);
router.get('/teachers', authenticate, adminController.getAllTeachers);
router.get('/students', authenticate, adminController.getAllStudents);
router.get('/staff', authenticate, adminController.getAllStaff);
router.get('/classes', authenticate, adminController.getAllClasses);
router.get('/activities', authenticate, adminController.getActivities);
router.get('/announcements', authenticate, adminController.getAnnouncements);

// POST routes
router.post('/students', authenticate, adminController.addStudent);

module.exports = router;
