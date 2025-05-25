const jwt = require('jsonwebtoken');

// Replace this with your actual secret or use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Expect header format: 'Bearer <token>'
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token missing from authorization header' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // decoded should contain user info, e.g., { userId, role, ... }
        req.user = {
            user_id: decoded.user_id,
            college_code:decoded.college_code,
            role: decoded.role,
            // any other fields you embed in your token
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = {
    authenticate
};
