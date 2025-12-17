// src/utils/api.js
const API_BASE_URL = 'https://pets.сделай.site/api';

// Упрощенная функция для API запросов
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };
  
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  try {
    console.log(`Запрос ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    console.log(`Статус ответа ${endpoint}:`, response.status);
    
    if (response.status === 204) {
      return { success: true, status: 204 };
    }
    
    const text = await response.text();
    let data = {};
    
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Ошибка парсинга JSON для', endpoint, ':', e);
      }
    }
    
    if (response.ok) {
      return data;
    } else {
      console.error(`Ошибка ${response.status} для ${endpoint}:`, data);
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Перенаправляем на страницу входа только если мы не на ней
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login';
        }
      }
      
      throw {
        status: response.status,
        data: data,
        message: data.error?.message || 'Ошибка запроса',
        errors: data.error?.errors || {},
      };
    }
  } catch (error) {
    console.error(`Ошибка сети для ${endpoint}:`, error);
    throw error;
  }
};

// Функция для получения списка пользователей
export const getUsersList = async () => {
  try {
    const response = await apiRequest('/users');
    return response.data?.users || [];
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    return [];
  }
};

// Функция для поиска пользователя по email
export const findUserByEmail = async (email) => {
  try {
    const users = await getUsersList();
    return users.find(user => user.email === email);
  } catch (error) {
    console.error('Ошибка поиска пользователя:', error);
    return null;
  }
};