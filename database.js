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

        await connection.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                subject_id INT AUTO_INCREMENT PRIMARY KEY,
                course_name VARCHAR(100),
                department VARCHAR(100),
                semester INT,
                subject_name VARCHAR(100) NOT NULL,
                subject_code VARCHAR(20) UNIQUE NOT NULL
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                attendance_id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT,
                student_id INT,
                date DATE NOT NULL,
                status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS exams (
                exam_id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT,
                subject VARCHAR(100),
                exam_type VARCHAR(50), -- midterm, final, etc.
                date DATE,
                max_marks INT,
                FOREIGN KEY (class_id) REFERENCES classes(class_id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS results (
                result_id INT AUTO_INCREMENT PRIMARY KEY,
                exam_id INT,
                student_id INT,
                marks_obtained INT,
                grade VARCHAR(5),
                FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS notices (
                notice_id INT AUTO_INCREMENT PRIMARY KEY,
                college_code VARCHAR(50),
                title VARCHAR(150),
                content TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_code) REFERENCES colleges(college_code),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS leave_applications (
                leave_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_type ENUM('student', 'teacher', 'staff'),
                reason TEXT,
                from_date DATE,
                to_date DATE,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS payments (
                payment_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                amount DECIMAL(10,2),
                purpose VARCHAR(100), -- Tuition, Hostel, Transport, etc.
                payment_date DATE,
                status ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );
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

module.exports = {
    initializeDatabase,
    pool,
    getDB,
};