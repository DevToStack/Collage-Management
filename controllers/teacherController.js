const { getDB } = require('../database');


exports.getDashboardData = async (req, res) => {
        const db = getDB();
        const { userId } = req.user; // Assuming user info is in req.user from auth middleware
        
        try {
            // Get teacher info first
            const [teacher] = await db.query('SELECT * FROM teachers WHERE user_id = ?', [userId]);
            if (!teacher.length) {
                return res.status(404).json({ error: 'Teacher not found' });
            }
            const teacherId = teacher[0].teacher_id;

            // Get counts for dashboard
            const [classes] = await db.query(`
                SELECT COUNT(*) as count 
                FROM classes 
                WHERE class_teacher_id = ?`, 
                [userId]
            );

            const [students] = await db.query(`
                SELECT COUNT(*) as count 
                FROM class_students cs
                JOIN classes c ON cs.class_id = c.class_id
                WHERE c.class_teacher_id = ?`, 
                [userId]
            );

            const [assignments] = await db.query(`
                SELECT COUNT(*) as count 
                FROM assignments 
                WHERE created_by = ?`, 
                [userId]
            );

            const [announcements] = await db.query(`
                SELECT COUNT(*) as count 
                FROM announcements 
                WHERE created_by = ?`, 
                [userId]
            );

            const [activities] = await db.query(`
                SELECT * FROM activities 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10`, 
                [userId]
            );

            const [todayClasses] = await db.query(`
                SELECT c.* 
                FROM classes c
                JOIN class_teachers ct ON c.class_id = ct.class_id
                WHERE ct.teacher_id = ?`, 
                [userId]
            );

            res.json({
                counts: {
                    students: students[0].count,
                    classes: classes[0].count,
                    assignments: assignments[0].count,
                    announcements: announcements[0].count
                },
                teacher: teacher[0],
                activities,
                classes: todayClasses
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.getClasses= async (req, res) => {
        const db = getDB();
        const { userId } = req.user;
        
        try {
            const [rows] = await db.query(`
                SELECT c.* 
                FROM classes c
                JOIN class_teachers ct ON c.class_id = ct.class_id
                WHERE ct.teacher_id = ?`, 
                [userId]
            );
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.getClass= async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        const { userId } = req.user;
        
        try {
            const [rows] = await db.query(`
                SELECT c.* 
                FROM classes c
                JOIN class_teachers ct ON c.class_id = ct.class_id
                WHERE c.class_id = ? AND ct.teacher_id = ?`, 
                [id, userId]
            );
            
            if (!rows.length) {
                return res.status(404).json({ error: 'Class not found or not authorized' });
            }
            
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.getStudentsByClassId= async (req, res) => {
        const db = getDB();
        const { classId } = req.params;
        const { userId } = req.user;
        
        try {
            // Verify teacher has access to this class
            const [classCheck] = await db.query(`
                SELECT 1 
                FROM class_teachers 
                WHERE class_id = ? AND teacher_id = ?`, 
                [classId, userId]
            );
            
            if (!classCheck.length) {
                return res.status(403).json({ error: 'Not authorized to view this class' });
            }

            const [students] = await db.query(`
                SELECT s.* 
                FROM students s
                JOIN class_students cs ON s.student_id = cs.student_id
                WHERE cs.class_id = ?`, 
                [classId]
            );
            
            res.json(students);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.getAssignments=async (req, res) => {
        const db = getDB();
        const { userId } = req.user;
        
        try {
            const [rows] = await db.query(`
                SELECT a.*, c.course_name, c.department, c.semester 
                FROM assignments a
                JOIN classes c ON a.class_id = c.class_id
                JOIN class_teachers ct ON c.class_id = ct.class_id
                WHERE a.created_by = ? AND ct.teacher_id = ?
                ORDER BY a.due_date DESC`, 
                [userId, userId]
            );
            
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.saveAssignment=async (req, res) => {
        const db = getDB();
        const { userId } = req.user;
        const assignment = req.body;
        
        try {
            // Verify teacher has access to the class they're assigning to
            const [classCheck] = await db.query(`
                SELECT 1 
                FROM class_teachers 
                WHERE class_id = ? AND teacher_id = ?`, 
                [assignment.class_id, userId]
            );
            
            if (!classCheck.length) {
                return res.status(403).json({ error: 'Not authorized to assign to this class' });
            }

            if (assignment.assignment_id) {
                await db.query(`
                    UPDATE assignments 
                    SET class_id=?, subject=?, title=?, description=?, due_date=? 
                    WHERE assignment_id=? AND created_by=?`,
                    [
                        assignment.class_id, 
                        assignment.subject,
                        assignment.title, 
                        assignment.description, 
                        assignment.due_date, 
                        assignment.assignment_id,
                        userId
                    ]
                );
                res.json({ message: 'Assignment updated' });
            } else {
                const [result] = await db.query(`
                    INSERT INTO assignments 
                    (class_id, subject, title, description, due_date, created_by) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        assignment.class_id,
                        assignment.subject,
                        assignment.title, 
                        assignment.description, 
                        assignment.due_date, 
                        userId
                    ]
                );
                res.json({ 
                    message: 'Assignment created',
                    assignment_id: result.insertId 
                });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.deleteAssignment= async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        const { userId } = req.user;
        
        try {
            const [result] = await db.query(`
                DELETE FROM assignments 
                WHERE assignment_id = ? AND created_by = ?`, 
                [id, userId]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Assignment not found or not authorized' });
            }
            
            res.json({ message: 'Assignment deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.getAnnouncements= async (req, res) => {
        const db = getDB();
        const { userId } = req.user;
        
        try {
            const [announcements] = await db.query(`
                SELECT * FROM announcements 
                WHERE created_by = ? 
                ORDER BY created_at DESC`, 
                [userId]
            );
            
            res.json(announcements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.saveAnnouncement=async (req, res) => {
        const db = getDB();
        const { userId, college_code } = req.user; // Assuming college_code is in user object
        const announcement = req.body;
        
        try {
            if (announcement.announcement_id) {
                await db.query(`
                    UPDATE announcements 
                    SET title=?, description=?, target_audience=? 
                    WHERE announcement_id=? AND created_by=?`,
                    [
                        announcement.title, 
                        announcement.description, 
                        announcement.target_audience,
                        announcement.announcement_id,
                        userId
                    ]
                );
                res.json({ message: 'Announcement updated' });
            } else {
                const [result] = await db.query(`
                    INSERT INTO announcements 
                    (college_code, title, description, target_audience, created_by) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        college_code,
                        announcement.title, 
                        announcement.description, 
                        announcement.target_audience,
                        userId
                    ]
                );
                res.json({ 
                    message: 'Announcement created',
                    announcement_id: result.insertId 
                });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.deleteAnnouncement= async (req, res) => {
        const db = getDB();
        const { id } = req.params;
        const { userId } = req.user;
        
        try {
            const [result] = await db.query(`
                DELETE FROM announcements 
                WHERE announcement_id = ? AND created_by = ?`, 
                [id, userId]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Announcement not found or not authorized' });
            }
            
            res.json({ message: 'Announcement deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Additional methods for your schema
exports.getClassAttendance=async (req, res) => {
        const db = getDB();
        const { classId } = req.params;
        const { userId } = req.user;
        
        try {
            // Verify teacher has access to this class
            const [classCheck] = await db.query(`
                SELECT 1 
                FROM class_teachers 
                WHERE class_id = ? AND teacher_id = ?`, 
                [classId, userId]
            );
            
            if (!classCheck.length) {
                return res.status(403).json({ error: 'Not authorized to view this class' });
            }

            const [attendance] = await db.query(`
                SELECT a.*, s.full_name 
                FROM attendance a
                JOIN students s ON a.student_id = s.student_id
                WHERE a.class_id = ?
                ORDER BY a.date DESC`, 
                [classId]
            );
            
            res.json(attendance);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

exports.recordAttendance=async (req, res) => {
        const db = getDB();
        const { classId } = req.params;
        const { userId } = req.user;
        const { date, records } = req.body; // records = [{student_id, status}]
        
        try {
            // Verify teacher has access to this class
            const [classCheck] = await db.query(`
                SELECT 1 
                FROM class_teachers 
                WHERE class_id = ? AND teacher_id = ?`, 
                [classId, userId]
            );
            
            if (!classCheck.length) {
                return res.status(403).json({ error: 'Not authorized to record attendance for this class' });
            }

            await db.beginTransaction();
            
            try {
                // Delete existing records for this date/class to prevent duplicates
                await db.query(`
                    DELETE FROM attendance 
                    WHERE class_id = ? AND date = ?`, 
                    [classId, date]
                );
                
                // Insert new records
                for (const record of records) {
                    await db.query(`
                        INSERT INTO attendance 
                        (class_id, student_id, date, status) 
                        VALUES (?, ?, ?, ?)`,
                        [classId, record.student_id, date, record.status]
                    );
                }
                
                await db.commit();
                res.json({ message: 'Attendance recorded successfully' });
            } catch (err) {
                await db.rollback();
                throw err;
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
