const db = require('../config/db');

// Mượn sách (Check-out)
exports.borrowBook = async (req, res) => {
  const { userId, rfidTag } = req.body; // Quét mã RFID của sách
  const librarianId = req.user.userId;

  try {
    // 1. Tìm bản sao sách từ rfidTag
    const [copies] = await db.query('SELECT * FROM book_copies WHERE rfid_tag = ?', [rfidTag]);
    if (copies.length === 0) return res.status(404).json({ message: 'Book copy not found' });

    const copy = copies[0];
    if (copy.status !== 'available') {
      return res.status(400).json({ message: `Book is currently ${copy.status}` });
    }

    // 2. Lấy số ngày mượn từ cấu hình system_settings
    const [settings] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "max_borrow_days"');
    const maxDays = parseInt(settings[0]?.setting_value || '14');

    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(checkoutDate.getDate() + maxDays);

    // 3. Tạo record mượn sách & Cập nhật trạng thái cuốn sách
    await db.query(
      'INSERT INTO loans (user_id, copy_id, checkout_date, due_date, issued_by) VALUES (?, ?, ?, ?, ?)',
      [userId, copy.copy_id, checkoutDate, dueDate, librarianId]
    );

    await db.query('UPDATE book_copies SET status = "borrowed" WHERE copy_id = ?', [copy.copy_id]);

    res.json({ message: 'Book borrowed successfully', dueDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Trả sách (Check-in)
exports.returnBook = async (req, res) => {
  const { rfidTag } = req.body;

  try {
    const [copies] = await db.query('SELECT * FROM book_copies WHERE rfid_tag = ?', [rfidTag]);
    if (copies.length === 0) return res.status(404).json({ message: 'Book copy not found' });

    const copy = copies[0];
    const [loans] = await db.query('SELECT * FROM loans WHERE copy_id = ? AND status = "active"', [copy.copy_id]);

    if (loans.length === 0) return res.status(400).json({ message: 'No active loan found for this book' });

    const loan = loans[0];
    const returnDate = new Date();

    // Cập nhật lượt mượn thành đã trả
    await db.query('UPDATE loans SET return_date = ?, status = "returned" WHERE loan_id = ?', [returnDate, loan.loan_id]);
    await db.query('UPDATE book_copies SET status = "available" WHERE copy_id = ?', [copy.copy_id]);

    // Kiểm tra quá hạn và tính tiền phạt
    if (returnDate > new Date(loan.due_date)) {
      const diffTime = Math.abs(returnDate - new Date(loan.due_date));
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const [settings] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "daily_fine_amount"');
      const dailyFine = parseFloat(settings[0]?.setting_value || '5000');
      const totalFine = overdueDays * dailyFine;

      await db.query(
        'INSERT INTO fines (loan_id, user_id, fine_amount, fine_type) VALUES (?, ?, ?, "overdue")',
        [loan.loan_id, loan.user_id, totalFine]
      );

      return res.json({ message: 'Book returned with fine', overdueDays, fineAmount: totalFine });
    }

    res.json({ message: 'Book returned successfully on time' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Patron tự gia hạn sách
exports.renewBook = async (req, res) => {
    const { loanId } = req.body;
    const userId = req.user.userId;

    try {
        // 1. Kiểm tra thông tin loan
        const [loans] = await db.query(
            'SELECT * FROM loans WHERE loan_id = ? AND user_id = ? AND status = "active"',
            [loanId, userId]
        );

        if (loans.length === 0) {
            return res.status(404).json({ message: 'Active loan not found.' });
        }

        const loan = loans[0];

        // 2. Kiểm tra xem sách có bị quá hạn chưa (quá hạn thì không cho gia hạn, bắt buộc ra thư viện đóng phạt)
        if (new Date() > new Date(loan.due_date)) {
            return res.status(400).json({ message: 'Book is overdue. Please return the book and pay the fine.' });
        }

        // 3. Tìm book_id của bản sao này để check xem có ai đặt trước không
        const [copies] = await db.query('SELECT book_id FROM book_copies WHERE copy_id = ?', [loan.copy_id]);
        const bookId = copies[0].book_id;

        // 4. Kiểm tra xem có ai đang "pending" chờ lấy cuốn sách này không
        const [reservations] = await db.query(
            'SELECT * FROM reservations WHERE book_id = ? AND status = "pending"',
            [bookId]
        );

        if (reservations.length > 0) {
            return res.status(400).json({ message: 'Cannot renew. Other patrons are waiting for this book.' });
        }

        // 5. Cho phép gia hạn thêm X ngày (từ system_settings)
        const [settings] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = "max_borrow_days"');
        const extraDays = parseInt(settings[0]?.setting_value || '14');

        const newDueDate = new Date(loan.due_date);
        newDueDate.setDate(newDueDate.getDate() + extraDays);

        await db.query('UPDATE loans SET due_date = ? WHERE loan_id = ?', [newDueDate, loanId]);

        res.json({ message: 'Book renewed successfully', newDueDate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};