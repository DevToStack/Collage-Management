const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all teacher routes
router.use(authenticate);

// Ensure only users with the 'teacher' role can access these routes
router.use((req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }
    next();
});

// Dashboard
router.get('/dashboard', teacherController.getDashboardData);

// Classes
router.get('/classes', teacherController.getClasses);
router.get('/classes/:id', teacherController.getClass);
router.get('/classes/:classId/students', teacherController.getStudentsByClassId);

// Assignments
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', teacherController.saveAssignment); // Create
router.put('/assignments/:id', teacherController.saveAssignment); // Update
router.delete('/assignments/:id', teacherController.deleteAssignment); // Delete

// Announcements
router.get('/announcements', teacherController.getAnnouncements);
router.post('/announcements', teacherController.saveAnnouncement); // Create
router.put('/announcements/:id', teacherController.saveAnnouncement); // Update
router.delete('/announcements/:id', teacherController.deleteAnnouncement); // Delete

// Attendance
router.get('/classes/:classId/attendance', teacherController.getClassAttendance);
router.post('/classes/:classId/attendance', teacherController.recordAttendance);

module.exports = router;
