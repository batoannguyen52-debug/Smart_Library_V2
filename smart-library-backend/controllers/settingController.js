const db = require('../config/db');

exports.getSettings = async (req, res, next) => {
    try {
        const [settings] = await db.query('SELECT * FROM system_settings');
        res.json(settings);
    } catch (error) {
        next(error); // Chuyển lỗi cho Global Error Handler xử lý
    }
};

exports.updateSetting = async (req, res, next) => {
    const { setting_key, setting_value } = req.body;
    try {
        await db.query(
            'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
            [setting_value, setting_key]
        );
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        next(error);
    }
};