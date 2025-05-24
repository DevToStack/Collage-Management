const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const adminController = require('../controllers/adminController');


//GET
router.get('/dashboard',auth, adminController.dashboard);
router.get('/teachers', auth, adminController.getAllTeachers);
router.get('/students',auth, adminController.getAllStudents);
router.get('/staff', auth, adminController.getAllStaff);
router.get('/classes', auth, adminController.getAllClasses);
router.get('/activities', auth, adminController.getActivities);
router.get('/announcements', auth, adminController.getAnnouncements);
//POST
router.post('/students',adminController.addStudent)

module.exports = router;
