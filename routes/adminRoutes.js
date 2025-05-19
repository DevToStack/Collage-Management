const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


//GET
router.get('/dashboard', adminController.dashboard);
router.get('/teachers', adminController.getAllTeachers);
router.get('/students', adminController.getAllStudents);
router.get('/staff', adminController.getAllStaff);
router.get('/classes', adminController.getAllClasses);
router.get('/activities', adminController.getActivities);


//POST
router.post('/students',adminController.addStudent)

module.exports = router;
