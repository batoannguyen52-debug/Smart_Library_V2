const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, email, fullName, roleId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await db.query(
      'INSERT INTO users (username, password_hash, email, role_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, roleId || 4] // Default Patron = 4
    );

    await db.query(
      'INSERT INTO user_profiles (user_id, full_name) VALUES (?, ?)',
      [userResult.insertId, fullName]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id 
       WHERE u.username = ?`, 
      [username]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.user_id, roleId: user.role_id, roleName: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role_name, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};