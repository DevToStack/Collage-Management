const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'rabi',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'collage_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        // Create tables if they don't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                college_code VARCHAR(50) NOT NULL,           -- Links user to college
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                mobile_number VARCHAR(15),
                role ENUM('admin', 'teacher', 'staff') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_code) REFERENCES colleges(college_code)
            );

        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS colleges (
                college_id INT AUTO_INCREMENT PRIMARY KEY,
                college_name VARCHAR(150) NOT NULL,
                college_code VARCHAR(50) UNIQUE NOT NULL,   -- Secret code for registration
                address TEXT,
                city VARCHAR(50),
                state VARCHAR(50),
                pincode VARCHAR(10),
                contact_email VARCHAR(100),
                contact_phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS students (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                college_code VARCHAR(50) NOT NULL,         -- Links student to college
                full_name VARCHAR(100) NOT NULL,
                dob DATE NOT NULL,
                gender VARCHAR(10),
                nationality VARCHAR(50),
                aadhaar_number VARCHAR(12),
                blood_group VARCHAR(5),
                category VARCHAR(20),
                
                mobile_number VARCHAR(15),
                email VARCHAR(100),
                address TEXT,
                city VARCHAR(50),
                state VARCHAR(50),
                pincode VARCHAR(10),
                
                father_name VARCHAR(100),
                mother_name VARCHAR(100),
                guardian_contact VARCHAR(15),
                guardian_occupation VARCHAR(50),
                guardian_income VARCHAR(20),
                
                enrollment_number VARCHAR(50),
                admission_number VARCHAR(50),
                course VARCHAR(50),
                department VARCHAR(50),
                year_of_admission YEAR,
                current_semester INT,
                mode_of_admission VARCHAR(50),
                previous_institution VARCHAR(100),
                previous_percentage DECIMAL(5,2),
                
                hostel_required BOOLEAN,
                transport_required BOOLEAN,
                scholarship_applied BOOLEAN,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_code) REFERENCES colleges(college_code)
            );

        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                teacher_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                department VARCHAR(100),
                qualification VARCHAR(100),
                experience_years INT,
                subjects_assigned TEXT,
                timetable_link TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );

        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS staff (
                staff_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    department VARCHAR(100),
                    designation VARCHAR(100),
                    shift_time VARCHAR(50),
                    assigned_tasks TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS classes (
                class_id INT AUTO_INCREMENT PRIMARY KEY,
                college_code VARCHAR(50) NOT NULL,
                course_name VARCHAR(100),
                department VARCHAR(100),
                semester INT,
                section VARCHAR(10), -- Optional (A, B, etc.)
                class_teacher_id INT, -- Refers to users.user_id
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_code) REFERENCES colleges(college_code),
                FOREIGN KEY (class_teacher_id) REFERENCES users(user_id)
            );

        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS class_students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT,
                student_id INT,
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );

        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS class_teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT,
                teacher_id INT,
                subject VARCHAR(100),
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (teacher_id) REFERENCES users(user_id)
            );
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                assignment_id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                subject VARCHAR(100),
                title VARCHAR(150),
                description TEXT,
                due_date DATE,
                created_by INT, -- teacher's user_id
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            );

        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS student_assignments (
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                submission TEXT,
                grade VARCHAR(10),
                submitted_at DATETIME,
                PRIMARY KEY (assignment_id, student_id),
                FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                announcement_id INT AUTO_INCREMENT PRIMARY KEY,
                college_code VARCHAR(50) NOT NULL,
                title VARCHAR(150),
                description TEXT,
                created_by INT, -- user_id of admin/teacher
                target_audience ENUM('all', 'students', 'teachers', 'staff'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_code) REFERENCES colleges(college_code),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            )

        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                user_type ENUM('student', 'teacher', 'admin') NOT NULL,
                action VARCHAR(100) NOT NULL,
                details VARCHAR(255) NOT NULL,
                reference_id INT,
                reference_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);

        
        // Create admin user if not exists (example password hash, replace in production)
        
        connection.release();
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Return the connection pool
function getDB() {
    if (!pool) {
        throw new Error('Database not initialized');
    }
    return pool;
}


// ========================
// TEACHER DASHBOARD FUNCTIONS (t*)
// ========================

async function getTeacherDashboardCounts(teacherId) {
    const [classes] = await pool.query(
        'SELECT COUNT(*) as count FROM classes WHERE teacher_id = ?', 
        [teacherId]
    );
    const [students] = await pool.query(
        `SELECT COUNT(*) as count FROM class_students cs
         JOIN classes c ON cs.class_id = c.id
         WHERE c.teacher_id = ?`, 
        [teacherId]
    );
    const [assignments] = await pool.query(
        'SELECT COUNT(*) as count FROM assignments WHERE teacher_id = ?', 
        [teacherId]
    );
    const [announcements] = await pool.query(
        `SELECT COUNT(*) as count FROM announcements 
         WHERE author_id = ? OR target_audience IN ('all', 'teachers')`, 
        [teacherId]
    );

    return {
        students: students[0].count,
        classes: classes[0].count,
        assignments: assignments[0].count,
        announcements: announcements[0].count
    };
}

async function getTeacherRecentActivities(teacherId) {
    const [rows] = await pool.query(
        `SELECT * FROM activities 
         WHERE user_id = ? AND user_type = 'teacher'
         ORDER BY created_at DESC LIMIT 5`, 
        [teacherId]
    );
    return rows;
}

async function getTeacherTodayClasses(teacherId) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const [rows] = await pool.query(
        `SELECT c.id, c.name, c.schedule, c.room_number as room, 
                (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count
         FROM classes c
         WHERE c.teacher_id = ? AND c.schedule LIKE ?`, 
        [teacherId, `%${today}%`]
    );
    return rows;
}

async function getTeacherClasses(teacherId) {
    const [rows] = await pool.query(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count
         FROM classes c
         WHERE c.teacher_id = ?`, 
        [teacherId]
    );
    return rows;
}

async function getTeacherAssignments(teacherId) {
    const [rows] = await pool.query(
        `SELECT a.*, c.name as class_name,
                (SELECT COUNT(*) FROM student_assignments WHERE assignment_id = a.id) as submissions,
                (SELECT COUNT(*) FROM student_assignments WHERE assignment_id = a.id AND grade IS NOT NULL) as graded
         FROM assignments a
         JOIN classes c ON a.class_id = c.id
         WHERE a.teacher_id = ?`, 
        [teacherId]
    );
    return rows;
}

// ========================
// STUDENT DASHBOARD FUNCTIONS (s*)
// ========================

async function getStudentDashboardCounts(studentId) {
    const [classes] = await pool.query(
        'SELECT COUNT(*) as count FROM class_students WHERE student_id = ?', 
        [studentId]
    );
    const [assignments] = await pool.query(
        `SELECT COUNT(*) as count FROM student_assignments sa
         JOIN assignments a ON sa.assignment_id = a.id
         WHERE sa.student_id = ?`, 
        [studentId]
    );
    const [pendingAssignments] = await pool.query(
        `SELECT COUNT(*) as count FROM assignments a
         JOIN class_students cs ON a.class_id = cs.class_id
         LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ?
         WHERE cs.student_id = ? AND sa.submission IS NULL AND a.due_date > NOW()`, 
        [studentId, studentId]
    );
    const [announcements] = await pool.query(
        `SELECT COUNT(*) as count FROM announcements 
         WHERE target_audience IN ('all', 'students') OR 
               (target_audience = 'specific_class' AND class_id IN 
                   (SELECT class_id FROM class_students WHERE student_id = ?))`, 
        [studentId]
    );

    return {
        classes: classes[0].count,
        assignments: assignments[0].count,
        pendingAssignments: pendingAssignments[0].count,
        announcements: announcements[0].count
    };
}

async function getStudentRecentActivities(studentId) {
    const [rows] = await pool.query(
        `SELECT * FROM activities 
         WHERE user_id = ? AND user_type = 'student'
         ORDER BY created_at DESC LIMIT 5`, 
        [studentId]
    );
    return rows;
}

async function getStudentClasses(studentId) {
    const [rows] = await pool.query(
        `SELECT c.*, t.name as teacher_name 
         FROM classes c
         JOIN class_students cs ON c.id = cs.class_id
         LEFT JOIN teachers t ON c.teacher_id = t.id
         WHERE cs.student_id = ?`, 
        [studentId]
    );
    return rows;
}

async function getStudentAssignments(studentId) {
    const [rows] = await pool.query(
        `SELECT a.*, c.name as class_name, sa.submission, sa.grade, sa.submitted_at,
                (SELECT name FROM teachers WHERE id = a.teacher_id) as teacher_name
         FROM assignments a
         JOIN classes c ON a.class_id = c.id
         JOIN class_students cs ON c.id = cs.class_id
         LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ?
         WHERE cs.student_id = ?`, 
        [studentId, studentId]
    );
    return rows;
}

// ========================
// ADMIN DASHBOARD FUNCTIONS (a*)
// ========================

async function getAdminDashboardCounts() {
    const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [teachers] = await pool.query('SELECT COUNT(*) as count FROM teachers');
    const [classes] = await pool.query('SELECT COUNT(*) as count FROM classes');
    const [assignments] = await pool.query('SELECT COUNT(*) as count FROM assignments');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [announcements] = await pool.query('SELECT COUNT(*) as count FROM announcements');

    return {
        totalUsers: users[0].count,
        students: students[0].count,
        teachers: teachers[0].count,
        classes: classes[0].count,
        assignments: assignments[0].count,
        announcements: announcements[0].count
    };
}

async function getAdminRecentActivities(limit = 10) {
    const [rows] = await pool.query(
        `SELECT a.*, u.name 
         FROM activities a 
         JOIN users u ON a.user_id = u.id 
         ORDER BY a.created_at DESC 
         LIMIT ?`, 
        [limit]
    );
    return rows;
}

async function getAdminLatestUsers(limit = 10) {
    const [rows] = await pool.query(
        `SELECT id, name, email, role, created_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT ?`, 
        [limit]
    );
    return rows;
}

async function getAllTeachers() {
    const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, t.subject, t.department 
         FROM users u
         JOIN teachers t ON u.id = t.user_id
         WHERE u.role = 'teacher'`
    );
    return rows;
}

async function getAllStudents() {
    const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, s.grade, s.parent_contact 
         FROM users u
         JOIN students s ON u.id = s.user_id
         WHERE u.role = 'student'`
    );
    return rows;
}

// ========================
// COMMON FUNCTIONS
// ========================

async function getAnnouncements(userId, userType) {
    let query = '';
    const params = [];
    
    if (userType === 'teacher') {
        query = `
            SELECT a.*, u.name as author_name 
            FROM announcements a
            JOIN users u ON a.author_id = u.id
            WHERE a.target_audience IN ('all', 'teachers') OR a.author_id = ?
            ORDER BY a.created_at DESC`;
        params.push(userId);
    } else if (userType === 'student') {
        query = `
            SELECT a.*, u.name as author_name 
            FROM announcements a
            JOIN users u ON a.author_id = u.id
            WHERE a.target_audience IN ('all', 'students') OR 
                  (a.target_audience = 'specific_class' AND a.class_id IN 
                      (SELECT class_id FROM class_students WHERE student_id = ?))
            ORDER BY a.created_at DESC`;
        params.push(userId);
    } else { // admin
        query = `
            SELECT a.*, u.name as author_name 
            FROM announcements a
            JOIN users u ON a.author_id = u.id
            ORDER BY a.created_at DESC`;
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getClassDetails(classId) {
    const [classData] = await pool.query(
        `SELECT c.*, u.name as teacher_name, t.subject
         FROM classes c
         LEFT JOIN teachers t ON c.teacher_id = t.id
         LEFT JOIN users u ON t.user_id = u.id
         WHERE c.id = ?`, 
        [classId]
    );
    
    if (classData.length === 0) return null;
    
    const [students] = await pool.query(
        `SELECT u.id, u.name, u.email, s.grade 
         FROM users u
         JOIN students s ON u.id = s.user_id
         JOIN class_students cs ON s.id = cs.student_id
         WHERE cs.class_id = ?`, 
        [classId]
    );
    
    const [assignments] = await pool.query(
        `SELECT a.*, u.name as teacher_name
         FROM assignments a
         JOIN teachers t ON a.teacher_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE a.class_id = ?`, 
        [classId]
    );
    
    return {
        ...classData[0],
        students,
        assignments
    };
}

// Activity logging
async function logActivity(userId, userType, action, details, referenceId = null, referenceType = null) {
    await pool.query(
        `INSERT INTO activities (user_id, user_type, action, details, reference_id, reference_type)
         VALUES (?, ?, ?, ?, ?, ?)`, 
        [userId, userType, action, details, referenceId, referenceType]
    );
}

module.exports = {
    initializeDatabase,
    pool,
    getDB,
    // Teacher dashboard functions
    getTeacherDashboardCounts,
    getTeacherRecentActivities,
    getTeacherTodayClasses,
    getTeacherClasses,
    getTeacherAssignments,
    
    // Student dashboard functions
    getStudentDashboardCounts,
    getStudentRecentActivities,
    getStudentClasses,
    getStudentAssignments,
    
    // Admin dashboard functions
    getAdminDashboardCounts,
    getAdminRecentActivities,
    getAllTeachers,
    getAllStudents,
    
    // Common functions
    getAnnouncements,
    getClassDetails,
    logActivity
};