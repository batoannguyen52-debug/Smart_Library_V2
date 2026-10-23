import { useState } from 'react';
import axiosClient from '../utils/axiosClient';

export default function Circulation() {
  const [rfidTag, setRfidTag] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const handleBorrow = async () => {
    try {
      const res = await axiosClient.post('/loans/borrow', { userId, rfidTag });
      setMessage({ type: 'success', text: `Mượn thành công! Hạn trả: ${new Date(res.data.dueDate).toLocaleDateString()}` });
      setRfidTag('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Lỗi mượn sách' });
    }
  };

  const handleReturn = async () => {
    try {
      const res = await axiosClient.post('/loans/return', { rfidTag });
      const txt = res.data.fineAmount ? `Trả sách trễ hạn. Nợ phạt: ${res.data.fineAmount}đ` : 'Trả sách thành công, đúng hạn!';
      setMessage({ type: res.data.fineAmount ? 'warning' : 'success', text: txt });
      setRfidTag('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Lỗi trả sách' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Nghiệp Vụ Quầy (Mượn / Trả)</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã Thẻ Sinh Viên / User ID (Chỉ dùng khi mượn)</label>
          <input type="text" className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch sách / Mã RFID (Quét bằng máy scan)</label>
          <input type="text" className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" value={rfidTag} onChange={(e) => setRfidTag(e.target.value)} />
        </div>
        
        <div className="flex gap-4 pt-4">
          <button onClick={handleBorrow} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Check-out (Cho mượn)</button>
          <button onClick={handleReturn} className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700">Check-in (Nhận trả)</button>
        </div>
      </div>
    </div>
  );
}