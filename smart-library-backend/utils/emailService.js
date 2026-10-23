const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOverdueNotice = async (userEmail, userName, bookTitle, fineAmount) => {
    const mailOptions = {
        from: `"Smart Library" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'THÔNG BÁO: Sách mượn đã quá hạn',
        html: `
            <h3>Chào ${userName},</h3>
            <p>Hệ thống Thư viện thông minh xin thông báo cuốn sách <strong>"${bookTitle}"</strong> bạn mượn đã quá hạn.</p>
            <p>Số tiền phạt hiện tại là: <strong>${fineAmount} VNĐ</strong>.</p>
            <p>Vui lòng mang sách đến trả thư viện sớm nhất có thể để tránh phát sinh thêm phí.</p>
            <br/>
            <p>Trân trọng,<br/>Ban quản lý Thư viện</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Overdue email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};