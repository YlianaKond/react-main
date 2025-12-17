// src/utils/auth.js
// Упрощенное управление авторизацией

export const saveUserData = (data) => {
  const userData = {
    id: data.id || '',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    token: data.token || '',
    registrationDate: data.registrationDate || '',
    ordersCount: data.ordersCount || 0,
    petsCount: data.petsCount || 0
  };
  
  localStorage.setItem('user_data', JSON.stringify(userData));
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  
  console.log('Данные сохранены:', userData);
};

export const getUserData = () => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const clearUserData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

// Получение ID пользователя из ответа API
export const extractUserIdFromResponse = (data) => {
  // Пробуем разные пути в ответе API
  if (data.data?.user?.id) return data.data.user.id;
  if (data.user?.id) return data.user.id;
  if (data.data?.id) return data.data.id;
  if (data.id) return data.id;
  
  // Пробуем получить из массива пользователей
  if (data.data?.users && Array.isArray(data.data.users)) {
    const currentUser = data.data.users.find(u => u.email === getUserData()?.email);
    if (currentUser?.id) return currentUser.id;
  }
  
  return null;
};