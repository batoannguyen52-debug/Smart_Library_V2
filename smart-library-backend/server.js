const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // [Mới] Bảo vệ HTTP Headers
const morgan = require('morgan'); // [Mới] Ghi log request
const rateLimit = require('express-rate-limit'); // [Mới] Chống Spam/DDoS
require('dotenv').config();

const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const fineRoutes = require('./routes/fineRoutes');
const settingRoutes = require('./routes/settingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const publicRoutes = require('./routes/publicRoutes');
const aiRoutes = require('./routes/aiRoutes');

require('./utils/cronJobs');

const app = express();

// ==========================================
// 1. MIDDLEWARE BẢO MẬT & HỆ THỐNG
// ==========================================
app.use(helmet()); // Ẩn các header nhạy cảm, chống XSS
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Chặn request có body quá lớn (chống crash RAM)

// Ghi log mọi request gọi tới server (Sẽ in ra console dạng: GET /api/books 200 15ms)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Thiết lập Rate Limiting (Chống Spam) chung cho toàn server
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Mỗi IP chỉ được gọi tối đa 100 requests trong 15 phút
    message: { message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' }
});
app.use('/api', limiter);

// Thiết lập Rate Limiting chặn brute-force password mạnh hơn cho Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 10, // Chỉ cho phép nhập sai / đăng nhập 10 lần/giờ
    message: { message: 'Quá nhiều lần thử đăng nhập, tài khoản tạm khóa trong 1 giờ.' }
});
app.use('/api/auth', authLimiter);


// ==========================================
// 2. KHAI BÁO ROUTES
// ==========================================
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);


// ==========================================
// 3. XỬ LÝ LỖI (ERROR HANDLERS)
// ==========================================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ==========================================
// 4. KHỞI CHẠY SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[OK] Smart Library Enterprise Server running on port ${PORT}`);
    console.log(`[OK] Environment: ${process.env.NODE_ENV || 'development'}`);
});