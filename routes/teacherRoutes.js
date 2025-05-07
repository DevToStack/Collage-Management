const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.get('/:id/dashboard', teacherController.dashboard);
router.get('/:id/activities', teacherController.activities);
router.get('/:id/classes', teacherController.classes);
router.get('/:id/classes/today', teacherController.todayClasses);
router.get('/:id/assignments', teacherController.assignments);

module.exports = router;
