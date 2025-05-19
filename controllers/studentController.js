const { getDB } = require('../database');

exports.dashboard = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [[result]] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM assignments WHERE class_id = (SELECT class_id FROM students WHERE id = ?)) AS total_assignments,
                (SELECT COUNT(*) FROM attendance WHERE student_id = ? AND status = 'Present') AS days_present
        `, [id, id]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Student dashboard error' });
    }
};

exports.classes = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`
            SELECT c.* FROM classes c
            JOIN students s ON s.class_id = c.id
            WHERE s.id = ?
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Student classes error' });
    }
};

exports.assignments = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`
            SELECT a.* FROM assignments a
            JOIN students s ON a.class_id = s.class_id
            WHERE s.id = ?
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Student assignments error' });
    }
};

exports.timetable = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`
            SELECT t.* FROM timetable t
            JOIN students s ON t.class_id = s.class_id
            WHERE s.id = ?
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Student timetable error' });
    }
};

exports.attendance = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`SELECT * FROM attendance WHERE student_id = ?`, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Attendance fetch error' });
    }
};
