const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/:id/dashboard', studentController.dashboard);
router.get('/:id/classes', studentController.classes);
router.get('/:id/assignments', studentController.assignments);
router.get('/:id/timetable', studentController.timetable);
router.get('/:id/attendance', studentController.attendance);

module.exports = router;
