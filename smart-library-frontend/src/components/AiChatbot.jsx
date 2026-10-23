import { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Chào bạn! Mình là Trợ lý AI của thư viện VNUK. Bạn cần tìm sách gì hay cần giải đáp nội quy không?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Gọi API Backend của chúng ta
      const res = await axiosClient.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Mất kết nối với não bộ AI...' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bật/tắt Chatbot */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-105 transition transform">
          <MessageSquare className="w-7 h-7" />
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold">Trợ lý Thư viện AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 rounded p-1"><X className="w-5 h-5"/></button>
          </div>
          
          {/* Nội dung chat */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border shadow-sm rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-400 text-xs italic">AI đang suy nghĩ...</div>}
          </div>

          {/* Ô nhập liệu */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              className="flex-1 px-3 py-2 border rounded-full text-sm outline-none focus:border-blue-500"
              placeholder="Nhập câu hỏi..." 
              value={input} onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}