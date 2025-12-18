
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, isAuthenticated, saveUserData } from '../utils/auth';
import './css/style.css';

function RealUserInfo() {
  const [userData, setUserData] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangePhone, setShowChangePhone] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные из localStorage
      const savedData = getUserData();
      
      if (savedData) {
        setUserData(savedData);
        setNewPhone(savedData.phone || '');
        setNewEmail(savedData.email || '');
        
        // Загружаем объявления пользователя
        await loadUserPets(savedData.email);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPets = async (userEmail) => {
    try {
      // Получаем ВСЕ объявления
      const response = await fetch('https://pets.сделай.site/api/search/order', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Все объявления с API:', data);
        
        let allPets = [];
        
        // Обрабатываем разные форматы ответа
        if (data.data?.orders && Array.isArray(data.data.orders)) {
          allPets = data.data.orders;
        } else if (data.data?.pets && Array.isArray(data.data.pets)) {
          allPets = data.data.pets;
        } else if (Array.isArray(data)) {
          allPets = data;
        } else if (data.data && Array.isArray(data.data)) {
          allPets = data.data;
        }
        
        // Фильтруем по email пользователя
        const userPetsList = allPets.filter(pet => {
          // Проверяем разные варианты поля email
          const petEmail = pet.email || pet.user_email || pet.contact_email;
          return petEmail === userEmail;
        });
        
        console.log('Объявления пользователя:', userPetsList);
        setUserPets(userPetsList);
        
        // Обновляем счетчик в localStorage
        if (userData) {
          const updatedUserData = {
            ...userData,
            petsCount: userPetsList.length,
            ordersCount: userPetsList.length
          };
          localStorage.setItem('user_data', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00' || dateString === 'unknown') {
      return 'Неизвестно';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Неизвестно';
      }
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Неизвестно';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'found':
        return <span className="badge bg-success">Найден</span>;
      case 'looking_for_home':
        return <span className="badge bg-warning text-dark">Ищет дом</span>;
      case 'lost':
        return <span className="badge bg-danger">Потерян</span>;
      default:
        return <span className="badge bg-secondary">Неизвестно</span>;
    }
  };

  const handleRefresh = () => {
    loadUserData();
  };

  // Функция изменения телефона
  const handleChangePhone = async () => {
    setPhoneError('');
    setPhoneSuccess('');
    
    // Валидация телефона
    const phoneRegex = /^\+?[0-9]+$/;
    const cleanPhone = newPhone.replace(/[^\d+]/g, '');
    
    if (!newPhone.trim()) {
      setPhoneError('Введите новый номер телефона');
      return;
    }
    
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError('Только цифры и знак +');
      return;
    }
    
    setPhoneLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const userData = getUserData();
      
      if (!token || !userData?.id) {
        setPhoneError('Вы не авторизованы или нет ID пользователя');
        setPhoneLoading(false);
        return;
      }
      
      // Отправляем запрос на изменение телефона согласно API спецификации
      const response = await fetch(`https://pets.сделай.site/api/users/${userData.id}/phone`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phone: cleanPhone
        })
      });
      
      console.log('Статус ответа на изменение телефона:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Ответ на изменение телефона:', result);
        
        // Обновляем данные в localStorage
        const updatedUserData = {
          ...userData,
          phone: cleanPhone
        };
        saveUserData(updatedUserData);
        setUserData(updatedUserData);
        
        setPhoneSuccess('Телефон успешно изменен!');
        setTimeout(() => {
          setShowChangePhone(false);
        }, 1500);
      } else if (response.status === 422) {
        const errorData = await response.json();
        console.log('Ошибка валидации телефона:', errorData);
        setPhoneError(errorData.error?.error || 'Ошибка валидации телефона');
      } else if (response.status === 401) {
        setPhoneError('Не авторизован. Пожалуйста, войдите снова.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorText = await response.text();
        console.error('Ошибка при изменении телефона:', errorText);
        setPhoneError('Ошибка сервера при изменении телефона');
      }
    } catch (error) {
      console.error('Ошибка при изменении телефона:', error);
      setPhoneError('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Функция изменения email
  const handleChangeEmail = async () => {
    setEmailError('');
    setEmailSuccess('');
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newEmail.trim()) {
      setEmailError('Введите новый email');
      return;
    }
    
    if (!emailRegex.test(newEmail)) {
      setEmailError('Некорректный формат email');
      return;
    }
    
    // Проверяем, не совпадает ли с текущим email
    if (newEmail === userData?.email) {
      setEmailError('Новый email совпадает с текущим');
      return;
    }
    
    setEmailLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const userData = getUserData();
      
      if (!token || !userData?.id) {
        setEmailError('Вы не авторизованы или нет ID пользователя');
        setEmailLoading(false);
        return;
      }
      
      // Отправляем запрос на изменение email согласно API спецификации
      const response = await fetch(`https://pets.сделай.site/api/users/${userData.id}/email`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: newEmail.trim()
        })
      });
      
      console.log('Статус ответа на изменение email:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Ответ на изменение email:', result);
        
        // Обновляем данные в localStorage
        const updatedUserData = {
          ...userData,
          email: newEmail.trim()
        };
        saveUserData(updatedUserData);
        setUserData(updatedUserData);
        
        // Обновляем email в localStorage для авторизации
        localStorage.setItem('user_email', newEmail.trim());
        
        setEmailSuccess('Email успешно изменен!');
        setTimeout(() => {
          setShowChangeEmail(false);
        }, 1500);
      } else if (response.status === 422) {
        const errorData = await response.json();
        console.log('Ошибка валидации email:', errorData);
        setEmailError(errorData.error?.error || 'Ошибка валидации email');
      } else if (response.status === 401) {
        setEmailError('Не авторизован. Пожалуйста, войдите снова.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorText = await response.text();
        console.error('Ошибка при изменении email:', errorText);
        setEmailError('Ошибка сервера при изменении email');
      }
    } catch (error) {
      console.error('Ошибка при изменении email:', error);
      setEmailError('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Функция для отмены изменения телефона
  const handleCancelChangePhone = () => {
    setShowChangePhone(false);
    setNewPhone(userData?.phone || '');
    setPhoneError('');
    setPhoneSuccess('');
  };

  // Функция для отмены изменения email
  const handleCancelChangeEmail = () => {
    setShowChangeEmail(false);
    setNewEmail(userData?.email || '');
    setEmailError('');
    setEmailSuccess('');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка данных профиля...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Не удалось загрузить данные пользователя
      </div>
    );
  }

  return (
    <div className="real-user-info">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-4">
                <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{width: 100, height: 100}}>
                  <i className="bi bi-person-fill text-white fs-1"></i>
                </div>
              </div>
              <h3 className="card-title">{userData.name || 'Пользователь'}</h3>
              <p className="text-muted">{userData.email || 'Email не указан'}</p>
              
              <div className="mt-4">
                <button 
                  className="btn btn-outline-primary btn-sm w-100 mb-2"
                  onClick={handleRefresh}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Обновить данные
                </button>
                
                {/* Кнопка изменения телефона */}
                <button 
                  className="btn btn-outline-secondary btn-sm w-100 mb-2"
                  onClick={() => {
                    setShowChangePhone(!showChangePhone);
                    setShowChangeEmail(false);
                  }}
                >
                  <i className="bi bi-telephone me-2"></i>
                  {showChangePhone ? 'Скрыть' : 'Изменить телефон'}
                </button>
                
                {/* Кнопка изменения email */}
                <button 
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={() => {
                    setShowChangeEmail(!showChangeEmail);
                    setShowChangePhone(false);
                  }}
                >
                  <i className="bi bi-envelope me-2"></i>
                  {showChangeEmail ? 'Скрыть' : 'Изменить email'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Информация о профиле
              </h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Имя</label>
                  <p className="fw-bold">{userData.name || 'Не указано'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Email</label>
                  {!showChangeEmail ? (
                    <>
                      <p className="fw-bold">{userData.email || 'Не указано'}</p>
                    </>
                  ) : (
                    <div className="email-change-form">
                      {emailError && (
                        <div className="alert alert-danger alert-dismissible fade show mb-2">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {emailError}
                          <button type="button" className="btn-close" onClick={() => setEmailError('')}></button>
                        </div>
                      )}
                      
                      {emailSuccess && (
                        <div className="alert alert-success alert-dismissible fade show mb-2">
                          <i className="bi bi-check-circle me-2"></i>
                          {emailSuccess}
                          <button type="button" className="btn-close" onClick={() => setEmailSuccess('')}></button>
                        </div>
                      )}
                      
                      <div className="input-group mb-2">
                        <span className="input-group-text">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="new@email.com"
                          disabled={emailLoading}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleChangeEmail}
                          disabled={emailLoading}
                        >
                          {emailLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Сохранение...
                            </>
                          ) : (
                            'Сохранить'
                          )}
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleCancelChangeEmail}
                          disabled={emailLoading}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Телефон</label>
                  {!showChangePhone ? (
                    <>
                      <p className="fw-bold">{userData.phone || 'Не указано'}</p>
                    </>
                  ) : (
                    <div className="phone-change-form">
                      {phoneError && (
                        <div className="alert alert-danger alert-dismissible fade show mb-2">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {phoneError}
                          <button type="button" className="btn-close" onClick={() => setPhoneError('')}></button>
                        </div>
                      )}
                      
                      {phoneSuccess && (
                        <div className="alert alert-success alert-dismissible fade show mb-2">
                          <i className="bi bi-check-circle me-2"></i>
                          {phoneSuccess}
                          <button type="button" className="btn-close" onClick={() => setPhoneSuccess('')}></button>
                        </div>
                      )}
                      
                      <div className="input-group mb-2">
                        <span className="input-group-text">
                          <i className="bi bi-telephone"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+79111234567"
                          disabled={phoneLoading}
                        />
                      </div>
                      <small className="form-text text-muted d-block mb-2">
                        Только цифры и знак +
                      </small>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleChangePhone}
                          disabled={phoneLoading}
                        >
                          {phoneLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Сохранение...
                            </>
                          ) : (
                            'Сохранить'
                          )}
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleCancelChangePhone}
                          disabled={phoneLoading}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Дата регистрации</label>
                  <p className="fw-bold">{formatDate(userData.registrationDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <h2 className="display-4 fw-bold">{userPets.length}</h2>
                  <p className="lead mb-0">Мои объявления</p>
                  <div className="mt-3">
                    <small>Всего: {userPets.length}</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <h2 className="display-4 fw-bold">{userData.ordersCount || 0}</h2>
                  <p className="lead mb-0">Всего заявок</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Список объявлений пользователя */}
          {userPets.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h4 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Мои объявления ({userPets.length})
                </h4>
              </div>
              <div className="card-body">
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {userPets.map(pet => (
                    <div key={pet.id} className="col">
                      <div className="card h-100 shadow-sm">
                        <div className="row g-0 h-100">
                          <div className="col-md-4">
                            {pet.photos && pet.photos.length > 0 ? (
                              <img 
                                src={`https://pets.сделай.site${pet.photos}`} 
                                className="img-fluid rounded-start h-100 w-100" 
                                alt={pet.kind}
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150x150?text=Нет+фото';
                                }}
                              />
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center h-100">
                                <i className="bi bi-image text-muted fs-1"></i>
                              </div>
                            )}
                          </div>
                          <div className="col-md-8">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title mb-0">{pet.kind || 'Не указано'}</h5>
                                <div>
                                  {getStatusBadge(pet.status)}
                                </div>
                              </div>
                              <p className="card-text small text-muted mb-2">
                                <i className="bi bi-geo-alt me-1"></i>
                                {pet.district || 'Район не указан'}
                              </p>
                              <p className="card-text small">
                                {pet.description && pet.description.length > 100
                                  ? `${pet.description.substring(0, 100)}...`
                                  : pet.description || 'Нет описания'}
                              </p>
                              <div className="mt-3">
                                <a 
                                  href={`/pet/${pet.id}`} 
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Подробнее
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                </div>
                <h5>У вас пока нет объявлений</h5>
                <p className="text-muted">Создайте первое объявление о найденном животном</p>
                <a href="/add-pet" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить объявление
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RealUserInfo;
