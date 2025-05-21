const { getDB } = require('../database');
const bcrypt = require('bcrypt'); // make sure to install it using `npm install bcrypt`

exports.registerCollege = async (req, res) => {
  const db = getDB();
  const {
    universityType, institutionCode, collegeName, collegeEmail,
    collegeContact, principalName, principalContact, principalEmail,
    password, area, city, state, pincode
  } = req.body;

  if (
    !universityType || !institutionCode || !collegeName || !collegeEmail ||
    !collegeContact || !principalName || !principalContact || !principalEmail ||
    !password || !area || !city || !state || !pincode
  ) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT * FROM colleges WHERE college_code = ?',
      [institutionCode]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'College code already exists.' });
    }

    // Insert into colleges table
    const [collegeResult] = await db.execute(
      `INSERT INTO colleges (college_name, college_code, address, city, state, pincode, contact_email, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [collegeName, institutionCode, area, city, state, pincode, collegeEmail, collegeContact]
    );

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table (role is 'admin' for the principal)
    await db.execute(
      `INSERT INTO users (college_code, full_name, email, password, mobile_number, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [institutionCode, principalName, principalEmail, hashedPassword, principalContact, 'admin']
    );

    res.status(201).json({
      message: 'College and admin user registered successfully.',
      college_id: collegeResult.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
