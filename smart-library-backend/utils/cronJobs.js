const cron = require('node-cron');
const db = require('../config/db');
const { sendOverdueNotice } = require('./emailService');

// Chạy vào lúc 00:00 (nửa đêm) mỗi ngày
cron.schedule('0 0 * * *', async () => {
    console.log('[System Actor] Running daily overdue fine calculation...');
    try {
        // Lấy số tiền phạt/ngày từ cấu hình
        const [settings] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "daily_fine_amount"');
        const dailyFine = parseFloat(settings[0]?.setting_value || '5000');

        // Tìm các lượt mượn đã quá hạn nhưng chưa trả
        const [overdueLoans] = await db.query(`
            SELECT loan_id, user_id, due_date 
            FROM loans 
            WHERE status = 'active' AND due_date < NOW()
        `);

        for (const loan of overdueLoans) {
            // Tính số ngày trễ
            const diffTime = Math.abs(new Date() - new Date(loan.due_date));
            const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const calculatedFine = overdueDays * dailyFine;

            // Kiểm tra xem đã có bản ghi phạt cho loan_id này chưa
            const [existingFines] = await db.query('SELECT fine_id FROM fines WHERE loan_id = ?', [loan.loan_id]);

            if (existingFines.length > 0) {
                // Cập nhật số tiền phạt tăng lên
                await db.query('UPDATE fines SET fine_amount = ? WHERE loan_id = ?', [calculatedFine, loan.loan_id]);
            } else {
                // Tạo mới bản ghi phạt
                await db.query(
                    'INSERT INTO fines (loan_id, user_id, fine_amount, fine_type) VALUES (?, ?, ?, "overdue")',
                    [loan.loan_id, loan.user_id, calculatedFine]
                );
            }
        }
        console.log(`[System Actor] Updated fines for ${overdueLoans.length} overdue loans.`);
    } catch (error) {
        console.error('[System Actor Error]:', error.message);
    }
});