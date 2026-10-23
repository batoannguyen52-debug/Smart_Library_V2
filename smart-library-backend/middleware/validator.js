const { validationResult, body } = require('express-validator');

// Hàm bắt lỗi chung, nếu có lỗi thì trả về 400 ngay lập tức
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Dữ liệu đầu vào không hợp lệ', 
            errors: errors.array() 
        });
    }
    next();
};

// Khai báo các quy tắc kiểm tra cho luồng Auth (Đăng ký/Đăng nhập)
const authValidationRules = {
    register: [
        body('username').isLength({ min: 3, max: 50 }).withMessage('Username phải từ 3-50 ký tự'),
        body('email').isEmail().withMessage('Email không đúng định dạng'),
        body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải chứa ít nhất 6 ký tự'),
        body('fullName').notEmpty().withMessage('Họ tên không được để trống')
    ],
    login: [
        body('username').notEmpty().withMessage('Username không được để trống'),
        body('password').notEmpty().withMessage('Password không được để trống')
    ]
};

// Bạn có thể viết thêm rules cho books, loans ở đây...

module.exports = { validateRequest, authValidationRules };