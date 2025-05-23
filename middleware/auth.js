const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT payload:', decoded);  // <-- Add this line
    req.user = decoded;  // Make sure this contains user ID as 'userId' or 'id'
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
