import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { BookCopy, DollarSign, AlertTriangle } from 'lucide-react';

export default function ManagerDashboard() {
  const [data, setData] = useState({ books: {}, financials: {}, topBooks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get('/dashboard/manager');
        setData(res.data);
      } catch (error) {
        console.error('Lỗi tải Dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Đang tải hệ thống...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div><p className="text-gray-500 text-sm">Sách trên kệ</p><h3 className="text-3xl font-bold">{data.books.available || 0}</h3></div>
          <div className="bg-blue-100 p-4 rounded-full"><BookCopy className="text-blue-600"/></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div><p className="text-gray-500 text-sm">Đã thu tiền phạt</p><h3 className="text-3xl font-bold text-green-600">{Number(data.financials.total_collected || 0).toLocaleString()}đ</h3></div>
          <div className="bg-green-100 p-4 rounded-full"><DollarSign className="text-green-600"/></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div><p className="text-gray-500 text-sm">Sách đang bị lỗi/mất</p><h3 className="text-3xl font-bold text-red-600">{data.books.issues || 0}</h3></div>
          <div className="bg-red-100 p-4 rounded-full"><AlertTriangle className="text-red-600"/></div>
        </div>
      </div>
      
      {/* Top sách mượn nhiều */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Top 5 Sách được mượn nhiều nhất tháng</h3>
        <ul className="space-y-3">
          {data.topBooks.map((book, idx) => (
            <li key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">{book.title}</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{book.borrow_count} lượt</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}