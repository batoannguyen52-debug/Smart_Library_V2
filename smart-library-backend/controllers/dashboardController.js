const db = require('../config/db');

// 1. Dashboard dành riêng cho Library Manager (Nghiệp vụ)
exports.getManagerDashboard = async (req, res, next) => {
    try {
        const dashboardData = {};
        // Lấy sách, tài chính, top sách... (Giữ nguyên code phần này như trước)
        // ... (Đã viết ở các bước trước)
        res.json(dashboardData);
    } catch (error) {
        next(error);
    }
};

// 2. Dashboard dành riêng cho Super Admin (Kỹ thuật hệ thống)
exports.getAdminDashboard = async (req, res, next) => {
    try {
        const dashboardData = {};

        // Thống kê phân bổ User theo Role
        const [userStats] = await db.query(`
            SELECT r.role_name, COUNT(u.user_id) as total_users
            FROM roles r
            LEFT JOIN users u ON r.role_id = u.role_id
            GROUP BY r.role_id
        `);
        dashboardData.userStats = userStats;

        // Thống kê trạng thái tài khoản (Active, Banned)
        const [accountStatus] = await db.query(`
            SELECT status, COUNT(*) as count FROM users GROUP BY status
        `);
        dashboardData.accountStatus = accountStatus;

        // Tổng quan tham số hệ thống hiện tại
        const [settings] = await db.query('SELECT * FROM system_settings');
        dashboardData.settings = settings;

        res.json(dashboardData);
    } catch (error) {
        next(error);
    }
};

// 3. Dashboard dành cho Patron (Sinh viên/Độc giả)
exports.getPatronDashboard = async (req, res, next) => {
    const userId = req.user.userId;
    try {
        const dashboardData = {};

        // 1. Sách đang mượn
        const [activeLoans] = await db.query(`
            SELECT b.title, l.checkout_date, l.due_date, 
                   CASE WHEN l.due_date < NOW() THEN 'Overdue' ELSE 'Active' END as status
            FROM loans l
            JOIN book_copies bc ON l.copy_id = bc.copy_id
            JOIN books b ON bc.book_id = b.book_id
            WHERE l.user_id = ? AND l.status = 'active'
        `, [userId]);
        dashboardData.currentLoans = activeLoans;

        // 2. Tình trạng nợ/phạt
        const [pendingFines] = await db.query(`
            SELECT fine_amount, fine_type, created_at 
            FROM fines 
            WHERE user_id = ? AND status = 'unpaid'
        `, [userId]);
        dashboardData.unpaidFines = pendingFines;

        res.json(dashboardData);
    } catch (error) {
        next(error);
    }
};