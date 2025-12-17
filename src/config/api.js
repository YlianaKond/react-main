export const API_BASE_URL = 'https://pets.сделай.site/api';
export const BASE_URL = 'https://pets.сделай.site';

export const apiRequest = async (endpoint, options = {}) =>{
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Проверяем статус ответа
    if (response.status === 204) {
      return { success: true };
    }
    
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      // Обработка ошибок
      if (response.status === 401) {
        // Не авторизован
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        window.location.href = '/login.html';
      }
      
      throw {
        status: response.status,
        message: data.error?.message || 'Ошибка запроса',
        errors: data.error?.errors || {},
      };
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};