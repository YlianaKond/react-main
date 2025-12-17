import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'https://pets.сделай.site/api';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Проверяем валидность токена
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data?.user || data.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        [isEmail ? 'email' : 'phone']: identifier,
        password: password
      };

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.data?.token || data.token;
        
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_email', identifier);
          
          // Получаем данные пользователя
          const userResponse = await fetch(`${API_BASE_URL}/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.data?.user || userData.user);
          }
          
          return { success: true };
        }
      }
      
      return { 
        success: false, 
        error: 'Неверный логин или пароль' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Ошибка сети' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};