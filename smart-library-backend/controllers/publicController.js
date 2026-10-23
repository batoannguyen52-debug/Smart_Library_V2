const db = require('../config/db');

exports.searchCatalog = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { q, category } = req.query;
    
    let sql = `
        SELECT b.book_id, b.title, b.isbn, p.publisher_name, GROUP_CONCAT(DISTINCT a.author_name) as authors,
               SUM(CASE WHEN bc.status = 'available' THEN 1 ELSE 0 END) as available_copies
        FROM books b
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
        LEFT JOIN book_author ba ON b.book_id = ba.book_id
        LEFT JOIN authors a ON ba.author_id = a.author_id
        LEFT JOIN book_category bcat ON b.book_id = bcat.book_id
        LEFT JOIN book_copies bc ON b.book_id = bc.book_id
        WHERE 1=1
    `;
    const params = [];

    if (q) {
        sql += ` AND (b.title LIKE ? OR b.isbn LIKE ?)`;
        params.push(`%${q}%`, `%${q}%`);
    }

    if (category) {
        sql += ` AND bcat.category_id = ?`;
        params.push(category);
    }

    sql += ` GROUP BY b.book_id LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
        const [results] = await db.query(sql, params);
        res.json({ page, limit, total_results: results.length, data: results });
    } catch (error) {
        next(error);
    }
};