import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { Users, UserX, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState({ userStats: [], accountStatus: [], settings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get('/dashboard/admin');
        setData(res.data);
      } catch (error) {
        console.error('Lỗi tải Admin Dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình hệ thống...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">System Health & Accounts</h2>
      
      {/* Cards thống kê tài khoản */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">Tổng số User (Tất cả)</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {data.userStats.reduce((sum, item) => sum + item.total_users, 0)}
            </h3>
          </div>
          <div className="bg-indigo-100 p-4 rounded-full"><Users className="text-indigo-600"/></div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">Tài khoản bị khóa (Banned)</p>
            <h3 className="text-3xl font-bold text-red-600">
              {data.accountStatus.find(s => s.status === 'banned')?.count || 0}
            </h3>
          </div>
          <div className="bg-red-100 p-4 rounded-full"><UserX className="text-red-600"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bảng phân bổ Role */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-lg mb-4">Phân bổ Vai trò (Roles)</h3>
          <ul className="space-y-3">
            {data.userStats.map((role, idx) => (
              <li key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium capitalize text-slate-700">{role.role_name.replace('_', ' ')}</span>
                <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm">{role.total_users} users</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bảng cấu hình hệ thống */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="text-slate-600" />
            <h3 className="font-bold text-lg">Tham số Hệ thống (System Settings)</h3>
          </div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {data.settings.map((setting, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-700">{setting.setting_key}</td>
                  <td className="py-3 text-right">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded border">{setting.setting_value}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}