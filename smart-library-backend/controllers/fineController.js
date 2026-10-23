const db = require('../config/db');

// Patron xem danh sách nợ phạt
exports.getMyFines = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [fines] = await db.query(
            'SELECT f.*, b.title FROM fines f JOIN loans l ON f.loan_id = l.loan_id JOIN book_copies bc ON l.copy_id = bc.copy_id JOIN books b ON bc.book_id = b.book_id WHERE f.user_id = ?',
            [userId]
        );
        res.json(fines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Librarian xác nhận thu tiền mặt từ độc giả
exports.payFine = async (req, res) => {
    const { fineId, paymentMethod } = req.body; // paymentMethod: 'cash', 'momo', v.v.

    try {
        await db.query('BEGIN');

        // 1. Lấy thông tin fine
        const [fines] = await db.query('SELECT * FROM fines WHERE fine_id = ? AND status = "unpaid"', [fineId]);
        if (fines.length === 0) {
            return res.status(404).json({ message: 'Fine not found or already paid' });
        }
        const fine = fines[0];

        // 2. Cập nhật trạng thái fine
        await db.query('UPDATE fines SET status = "paid" WHERE fine_id = ?', [fineId]);

        // 3. Ghi log vào bảng transactions
        await db.query(
            'INSERT INTO transactions (user_id, fine_id, amount, payment_method) VALUES (?, ?, ?, ?)',
            [fine.user_id, fine.fine_id, fine.fine_amount, paymentMethod]
        );

        await db.query('COMMIT');
        res.json({ message: 'Fine paid successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
};