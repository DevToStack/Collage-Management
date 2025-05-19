const { getDB } = require('../database');

exports.dashboard = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [[counts]] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM classes WHERE teacher_id = ?) AS total_classes,
                (SELECT COUNT(*) FROM students WHERE class_id IN (SELECT id FROM classes WHERE teacher_id = ?)) AS total_students,
                (SELECT COUNT(*) FROM assignments WHERE teacher_id = ?) AS total_assignments
        `, [id, id, id]);
        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: 'Teacher dashboard error' });
    }
};

exports.activities = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`SELECT * FROM activities WHERE teacher_id = ? ORDER BY date DESC LIMIT 10`, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Activities fetch error' });
    }
};

exports.classes = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`SELECT * FROM classes WHERE teacher_id = ?`, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Classes fetch error' });
    }
};

exports.todayClasses = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    const today = new Date().toISOString().slice(0, 10);
    try {
        const [rows] = await db.query(`SELECT * FROM classes WHERE teacher_id = ? AND date = ?`, [id, today]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Today classes fetch error' });
    }
};

exports.assignments = async (req, res) => {
    const db = getDB;
    const id = req.params.id;
    try {
        const [rows] = await db.query(`SELECT * FROM assignments WHERE teacher_id = ?`, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Assignments fetch error' });
    }
};
