const db = require('../config/db');

// Patron: Đặt trước một tựa sách
exports.createReservation = async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.userId;

    try {
        // 1. Kiểm tra xem thư viện có còn bản sao nào rảnh không
        const [availableCopies] = await db.query(
            'SELECT COUNT(*) as count FROM book_copies WHERE book_id = ? AND status = "available"',
            [bookId]
        );

        if (availableCopies[0].count > 0) {
            return res.status(400).json({ message: 'Book is currently available on the shelf. You can borrow it directly without reservation.' });
        }

        // 2. Kiểm tra xem người dùng đã đặt quyển này chưa
        const [existing] = await db.query(
            'SELECT * FROM reservations WHERE user_id = ? AND book_id = ? AND status = "pending"',
            [userId, bookId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already reserved this book.' });
        }

        // 3. Tạo record đặt trước
        await db.query(
            'INSERT INTO reservations (user_id, book_id, status) VALUES (?, ?, "pending")',
            [userId, bookId]
        );

        res.status(201).json({ message: 'Book reserved successfully. You will be notified when a copy is returned.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Librarian: Hủy đặt trước hoặc đánh dấu đã lấy sách
exports.updateReservationStatus = async (req, res) => {
    const { reservationId } = req.params;
    const { status } = req.body; // 'fulfilled' hoặc 'cancelled'

    try {
        await db.query('UPDATE reservations SET status = ? WHERE reservation_id = ?', [status, reservationId]);
        res.json({ message: `Reservation status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};