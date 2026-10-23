import { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.get(`/public/search?q=${query}`);
      setResults(res.data.data); // Lấy data từ kết quả phân trang
    } catch (error) {
      console.error('Lỗi tìm kiếm', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BookOpen className="text-blue-600 w-8 h-8"/> Tra Cứu Thư Viện (OPAC)
          </h1>
          <Link to="/login" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700">Đăng nhập</Link>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input 
            type="text" 
            placeholder="Nhập tên sách hoặc mã ISBN..." 
            className="flex-1 p-4 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
            <Search /> Tìm
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? <p className="p-8 text-center text-gray-500">Đang tìm kiếm...</p> : (
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4">Tên Sách (ISBN)</th>
                  <th className="p-4">Tác giả</th>
                  <th className="p-4 text-center">Sẵn sàng mượn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((book) => (
                  <tr key={book.book_id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium">{book.title} <br/><span className="text-sm text-gray-400">{book.isbn}</span></td>
                    <td className="p-4 text-gray-600">{book.authors || 'Đang cập nhật'}</td>
                    
                    {/* Đoạn code của bạn được gắn vào đây */}
                    <td className="p-4 text-center space-y-2">
                      {/* Trạng thái sách vật lý */}
                      <div className={`px-3 py-1 rounded-full text-sm font-bold inline-block ${book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {book.available_copies > 0 ? `Sách giấy: ${book.available_copies} cuốn` : 'Hết sách giấy'}
                      </div>
                      
                      {/* NÚT ĐỌC ONLINE (Nếu có link E-book) */}
                      {book.digital_file_url && (
                        <a 
                          href={book.digital_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block mt-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-purple-700 transition shadow-sm"
                        >
                          📖 Đọc Online (E-book)
                        </a>
                      )}
                    </td>

                  </tr>
                ))}
                {results.length === 0 && !loading && <tr><td colSpan="3" className="p-8 text-center text-gray-500">Không tìm thấy sách nào!</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}