// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Dashboard
router.get('/', teacherController.getDashboardData);

// Classes
router.get('/tclasses', teacherController.getClasses);
router.get('/tclasses/:id', teacherController.getClass);
router.post('/tclasses', teacherController.saveClass);
router.put('/tclasses/:id', teacherController.saveClass);
router.delete('/tclasses/:id', teacherController.deleteClass);

// Assignments
router.get('/tassignments', teacherController.getAssignments);
router.post('/tassignments', teacherController.saveAssignment);
router.put('/tassignments/:id', teacherController.saveAssignment);
router.delete('/tassignments/:id', teacherController.deleteAssignment);

// Students by class
router.get('/sclasses/:classId/students', teacherController.getStudentsByClassId);

// Announcements
router.get('/announcements', teacherController.getAnnouncements);
router.post('/announcements', teacherController.saveAnnouncement);
router.put('/announcements/:id', teacherController.saveAnnouncement);
router.delete('/announcements/:id', teacherController.deleteAnnouncement);

module.exports = router;
