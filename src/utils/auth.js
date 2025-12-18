export const saveUserData = (data) => {
  const userData = {
    id: data.id || '',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    token: data.token || '',
    registrationDate: data.registrationDate || data.created_at || new Date().toISOString().split('T')[0],
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
  if (!data) return null;
  
  const parsedData = JSON.parse(data);
  
  // Если нет даты регистрации, устанавливаем текущую дату
  if (!parsedData.registrationDate || parsedData.registrationDate === 'unknown') {
    parsedData.registrationDate = new Date().toISOString().split('T')[0];
    localStorage.setItem('user_data', JSON.stringify(parsedData));
  }
  
  return parsedData;
};

export const clearUserData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

// Функция для увеличения счетчика объявлений
export const incrementPetsCount = () => {
  const userData = getUserData();
  if (!userData) return;
  
  const updatedData = {
    ...userData,
    petsCount: (userData.petsCount || 0) + 1,
    ordersCount: (userData.ordersCount || 0) + 1
  };
  
  localStorage.setItem('user_data', JSON.stringify(updatedData));
};

// Функция для обновления счетчиков объявлений
export const updateUserPetsCount = (count) => {
  const userData = getUserData();
  if (!userData) return;
  
  const updatedData = {
    ...userData,
    petsCount: count,
    ordersCount: count
  };
  
  localStorage.setItem('user_data', JSON.stringify(updatedData));
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