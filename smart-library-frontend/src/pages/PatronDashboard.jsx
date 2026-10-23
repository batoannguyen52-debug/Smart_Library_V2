import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { Clock, AlertCircle } from 'lucide-react';

export default function PatronDashboard() {
  const [data, setData] = useState({ currentLoans: [], unpaidFines: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get('/dashboard/patron');
        setData(res.data);
      } catch (error) {
        console.error('Lỗi tải dữ liệu', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* Cards thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Sách đang mượn</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.currentLoans.length}</h3>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Tổng tiền phạt (VNĐ)</p>
            <h3 className="text-3xl font-bold text-red-600">
              {data.unpaidFines.reduce((sum, f) => sum + parseFloat(f.fine_amount), 0).toLocaleString()}
            </h3>
          </div>
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Bảng sách đang mượn */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Chi tiết sách đang mượn</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Tên sách</th>
              <th className="p-4">Ngày mượn</th>
              <th className="p-4">Hạn trả</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.currentLoans.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500">Bạn không có sách nào đang mượn</td></tr>
            ) : (
              data.currentLoans.map((loan, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{loan.title}</td>
                  <td className="p-4 text-gray-600">{new Date(loan.checkout_date).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">{new Date(loan.due_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}