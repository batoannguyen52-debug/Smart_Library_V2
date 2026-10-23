import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { username, password });
      const { token, role, username: resUser } = response.data;
      
      const userData = { username: resUser, role, token };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Phân luồng trang chủ theo Role
      if (role === 'patron') navigate('/dashboard');
      else navigate('/admin');
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Lỗi đăng nhập' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};