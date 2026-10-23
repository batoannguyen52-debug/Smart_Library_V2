const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
    try {
        const [profile] = await db.query(`
            SELECT u.username, u.email, p.full_name, p.phone_number, p.address, p.rfid_card_code 
            FROM users u JOIN user_profiles p ON u.user_id = p.user_id 
            WHERE u.user_id = ?`, 
            [req.user.userId]
        );
        res.json(profile[0]);
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT password_hash FROM users WHERE user_id = ?', [req.user.userId]);
        
        const isMatch = await bcrypt.compare(oldPassword, users[0].password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedNewPassword, req.user.userId]);
        
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};