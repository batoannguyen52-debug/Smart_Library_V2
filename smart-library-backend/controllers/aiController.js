const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo AI với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
    const { message } = req.body;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Cấp bối cảnh (Context) cho AI biết nó là ai
        const prompt = `
            Bạn là một thủ thư AI thông minh của Thư viện Đại học VNUK. 
            Nhiệm vụ của bạn là tư vấn sách, giải đáp nội quy thư viện và hướng dẫn sinh viên. 
            Trả lời ngắn gọn, thân thiện và xưng "mình" gọi "bạn".
            Câu hỏi của sinh viên: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        res.json({ reply: responseText });
    } catch (error) {
        console.error("Lỗi AI:", error);
        res.status(500).json({ reply: "Xin lỗi, hệ thống AI của thư viện đang bảo trì. Bạn vui lòng quay lại sau nhé!" });
    }
};