// Middleware xử lý lỗi 404 (Route not found)
const notFoundHandler = (req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} không tồn tại trên server` });
};

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    // Nếu là lỗi cấu trúc Database (ví dụ: trùng lặp key)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Dữ liệu này đã tồn tại trong hệ thống (Trùng lặp)' });
    }

    // Lỗi mặc định
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)',
        // Chỉ hiện chi tiết lỗi nếu ở môi trường phát triển (Dev)
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = { notFoundHandler, globalErrorHandler };