import { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Book, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Book className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">Smart Library</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Menu cho Độc giả */}
          {user?.role === 'patron' && (
            <Link to="/patron-dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
              <LayoutDashboard className="w-5 h-5" /> Dashboard Độc giả
            </Link>
          )}

          {/* Menu TÁCH BIỆT CHO MANAGER */}
          {user?.role === 'library_manager' && (
            <Link to="/manager-dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
              <LayoutDashboard className="w-5 h-5" /> Quản trị Nghiệp vụ
            </Link>
          )}

          {/* Menu TÁCH BIỆT CHO SUPER ADMIN */}
          {user?.role === 'super_admin' && (
            <Link to="/admin-dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
              <Settings className="w-5 h-5" /> Quản trị Hệ thống (IT)
            </Link>
          )}

          {/* Menu cho Thủ thư (Librarian) / Admin */}
          {(user?.role === 'super_admin' || user?.role === 'librarian' || user?.role === 'library_manager') && (
            <>
              <Link to="/circulation" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
                <Book className="w-5 h-5" /> Quầy Mượn/Trả sách
              </Link>
            </>
          )}
          
          <Link to="/search" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
             Tra cứu sách nội bộ
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">{user?.username}</p>
              <p className="text-sm text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Hệ thống Thư viện VNUK</h2>
        </header>
        <div className="p-6">
          <Outlet /> {/* Các trang con sẽ render ở đây */}
        </div>
      </main>
    </div>
  );
}