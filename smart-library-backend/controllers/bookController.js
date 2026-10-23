const db = require('../config/db');

exports.getAllBooks = async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT b.book_id, b.title, b.isbn, p.publisher_name, 
             COUNT(bc.copy_id) as total_copies,
             SUM(CASE WHEN bc.status = 'available' THEN 1 ELSE 0 END) as available_copies
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN book_copies bc ON b.book_id = bc.book_id
      GROUP BY b.book_id
    `);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBookCopy = async (req, res) => {
  const { bookId, rfidTag, barcode, shelfLocation } = req.body;
  try {
    await db.query(
      'INSERT INTO book_copies (book_id, rfid_tag, barcode, shelf_location) VALUES (?, ?, ?, ?)',
      [bookId, rfidTag, barcode, shelfLocation]
    );
    res.status(201).json({ message: 'Book copy added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm đầu sách mới (Title)
exports.createBook = async (req, res) => {
    const { isbn, title, publisherId, publicationYear, description, categoryIds, authorIds } = req.body;
    
    try {
        await db.query('BEGIN'); // Bắt đầu Transaction vì cần insert vào nhiều bảng

        // 1. Insert bảng books
        const [bookResult] = await db.query(
            'INSERT INTO books (isbn, title, publisher_id, publication_year, description) VALUES (?, ?, ?, ?, ?)',
            [isbn, title, publisherId, publicationYear, description]
        );
        const newBookId = bookResult.insertId;

        // 2. Insert bảng book_category (Nhiều thể loại)
        if (categoryIds && categoryIds.length > 0) {
            const categoryValues = categoryIds.map(catId => [newBookId, catId]);
            await db.query('INSERT INTO book_category (book_id, category_id) VALUES ?', [categoryValues]);
        }

        // 3. Insert bảng book_author (Nhiều tác giả)
        if (authorIds && authorIds.length > 0) {
            const authorValues = authorIds.map(authId => [newBookId, authId]);
            await db.query('INSERT INTO book_author (book_id, author_id) VALUES ?', [authorValues]);
        }

        await db.query('COMMIT');
        res.status(201).json({ message: 'Book created successfully', bookId: newBookId });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật thông tin sách
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        await db.query('UPDATE books SET title = ?, description = ? WHERE book_id = ?', [title, description, id]);
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xóa sách
exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM books WHERE book_id = ?', [id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};