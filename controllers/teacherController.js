// controllers/teacherController.js
const { getDB } = require('../database'); // replace with your DB connection logic

const teacherController = {
    
    getDashboardData: async (req, res) => {
        const db = getDB();
        const { teacherId } = req.query;
        try {
            const [students] = await db.query('SELECT COUNT(*) as count FROM students WHERE teacher_id = ?', [teacherId]);
            const [classes] = await db.query('SELECT COUNT(*) as count FROM classes WHERE class_teacher_id = ?', [teacherId]);
            const [assignments] = await db.query('SELECT COUNT(*) as count FROM assignments WHERE teacher_id = ?', [teacherId]);
            const [announcements] = await db.query('SELECT COUNT(*) as count FROM announcements WHERE teacher_id = ?', [teacherId]);
            const [activities] = await db.query('SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC', [teacherId]);
            const [todayClasses] = await db.query('SELECT * FROM classes WHERE teacher_id = ? AND DATE(schedule) = CURDATE()', [teacherId]);

            res.json({
                counts: {
                    students: students[0].count,
                    classes: classes[0].count,
                    assignments: assignments[0].count,
                    announcements: announcements[0].count
                },
                activities,
                classes: todayClasses
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getClasses: async (req, res) => {
        const db = getDB();
        const { teacherId } = req.query;
        try {
            const [rows] = await db.query('SELECT * FROM classes WHERE teacher_id = ?', [teacherId]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getClass: async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        try {
            const [rows] = await db.query('SELECT * FROM classes WHERE id = ?', [id]);
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    saveClass: async (req, res) => {
        const db = getDB();
        const cls = req.body;
        try {
            if (cls.id) {
                await db.query('UPDATE classes SET name=?, grade_level=?, schedule=?, room_number=? WHERE id=?',
                    [cls.name, cls.grade_level, cls.schedule, cls.room_number, cls.id]);
                res.json({ message: 'Class updated' });
            } else {
                await db.query('INSERT INTO classes (name, grade_level, schedule, room_number, teacher_id) VALUES (?, ?, ?, ?, ?)',
                    [cls.name, cls.grade_level, cls.schedule, cls.room_number, cls.teacher_id]);
                res.json({ message: 'Class created' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteClass: async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        try {
            await db.query('DELETE FROM classes WHERE id = ?', [id]);
            res.json({ message: 'Class deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Repeat same pattern for assignments
    getAssignments: async (req, res) => {
        const db = getDB();
        const { teacherId } = req.query;
        try {
            const [rows] = await db.query('SELECT * FROM assignments WHERE teacher_id = ?', [teacherId]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    saveAssignment: async (req, res) => {
        const db = getDB();
        const assignment = req.body;
        try {
            if (assignment.id) {
                await db.query('UPDATE assignments SET title=?, description=?, due_date=? WHERE id=?',
                    [assignment.title, assignment.description, assignment.due_date, assignment.id]);
                res.json({ message: 'Assignment updated' });
            } else {
                await db.query('INSERT INTO assignments (title, description, due_date, teacher_id) VALUES (?, ?, ?, ?)',
                    [assignment.title, assignment.description, assignment.due_date, assignment.teacher_id]);
                res.json({ message: 'Assignment created' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteAssignment: async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        try {
            await db.query('DELETE FROM assignments WHERE id = ?', [id]);
            res.json({ message: 'Assignment deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Student Listing
    getStudentsByClassId: async (req, res) => {
        const db = getDB();
        const { classId } = req.params;
        try {
            const [students] = await db.query('SELECT * FROM students WHERE class_id = ?', [classId]);
            res.json(students);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Announcements
    getAnnouncements: async (req, res) => {
        const db = getDB();
        const { userId } = req.query;
        try {
            const [announcements] = await db.query('SELECT * FROM announcements WHERE teacher_id = ?', [userId]);
            res.json(announcements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    saveAnnouncement: async (req, res) => {
        const db = getDB();
        const announcement = req.body;
        try {
            if (announcement.id) {
                await db.query('UPDATE announcements SET title=?, content=? WHERE id=?',
                    [announcement.title, announcement.content, announcement.id]);
                res.json({ message: 'Announcement updated' });
            } else {
                await db.query('INSERT INTO announcements (title, content, teacher_id) VALUES (?, ?, ?)',
                    [announcement.title, announcement.content, announcement.teacher_id]);
                res.json({ message: 'Announcement created' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteAnnouncement: async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        try {
            await db.query('DELETE FROM announcements WHERE id = ?', [id]);
            res.json({ message: 'Announcement deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = teacherController;
