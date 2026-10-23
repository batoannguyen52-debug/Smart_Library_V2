import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Địa chỉ Backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token trước khi gửi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bắt lỗi toàn cục (ví dụ: Token hết hạn -> Tự động đăng xuất)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;