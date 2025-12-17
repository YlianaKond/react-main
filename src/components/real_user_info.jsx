import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Добавляем useLocation
import { apiRequest } from '../config/api';
import { getUserData, clearUserData, saveUserData } from '../utils/auth';
import './css/style.css';

function RealUserInfo() {
    const navigate = useNavigate();
    const location = useLocation(); // Добавляем для отслеживания изменений URL
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(''); // 'phone', 'email'
    const [editForm, setEditForm] = useState({
        phone: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(0); // Для принудительного обновления

    useEffect(() => {
        loadUserData();
    }, [location.pathname, forceRefresh]); // Добавляем forceRefresh в зависимости

    // Загружаем данные пользователя
    const loadUserData = async () => {
        setLoading(true);
        try {
            const storedData = getUserData();
            
            if (!storedData || !storedData.token) {
                navigate('/login');
                return;
            }

            console.log('Загружаем данные пользователя из localStorage:', storedData);
            
            // Устанавливаем данные из localStorage
            setUserData(storedData);
            
            // Пробуем загрузить объявления, если есть ID
            if (storedData.id) {
                await loadUserOrders(storedData.id);
                // После загрузки объявлений обновляем статистику
                await updateUserStats(storedData.id);
            } else {
                console.log('ID пользователя не найден, пропускаем загрузку объявлений');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setErrors({ general: ['Ошибка загрузки данных'] });
        } finally {
            setLoading(false);
        }
    };

    // Загружаем объявления пользователя
    const loadUserOrders = async (userId) => {
        setOrdersLoading(true);
        try {
            console.log('Загрузка объявлений для пользователя ID:', userId);
            
            const response = await apiRequest(`/users/orders/${userId}`);
            
            if (response.data?.orders) {
                const orders = Array.isArray(response.data.orders) ? response.data.orders : [];
                console.log('Загружено объявлений:', orders.length);
                setUserOrders(orders);
                
                // Обновляем количество объявлений в данных пользователя
                if (orders.length > 0) {
                    updateLocalUserData({ ordersCount: orders.length });
                }
            } else if (response.status === 204) {
                console.log('Нет объявлений');
                setUserOrders([]);
                updateLocalUserData({ ordersCount: 0 });
            }
        } catch (error) {
            console.error('Ошибка загрузки объявлений:', error);
            setUserOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Обновление статистики пользователя
    const updateUserStats = async (userId) => {
        try {
            // Пробуем получить актуальные данные пользователя
            const users = await apiRequest('/users');
            
            if (users.data?.users && Array.isArray(users.data.users)) {
                const currentUser = users.data.users.find(u => u.id === userId);
                
                if (currentUser) {
                    // Обновляем локальные данные
                    const updatedData = {
                        ...userData,
                        ordersCount: currentUser.ordersCount || userData.ordersCount || 0,
                        petsCount: currentUser.petsCount || userData.petsCount || 0,
                        registrationDate: currentUser.registrationDate || userData.registrationDate || ''
                    };
                    
                    setUserData(updatedData);
                    saveUserData(updatedData);
                    
                    console.log('Статистика обновлена:', {
                        ordersCount: updatedData.ordersCount,
                        petsCount: updatedData.petsCount
                    });
                }
            }
        } catch (error) {
            console.log('Не удалось обновить статистику:', error);
        }
    };

    // Обновление локальных данных пользователя
    const updateLocalUserData = (updates) => {
        if (userData) {
            const updatedData = {
                ...userData,
                ...updates
            };
            
            setUserData(updatedData);
            saveUserData(updatedData);
        }
    };

    // Расчет дней с регистрации
    const calculateDaysSinceRegistration = () => {
        if (!userData?.registrationDate) return 0;
        
        try {
            const [day, month, year] = userData.registrationDate.split('-');
            const regDate = new Date(year, month - 1, day);
            const today = new Date();
            const diffTime = Math.abs(today - regDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (e) {
            return 0;
        }
    };

    // Обработка изменения формы
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Обновление телефона (локальное)
    const handleUpdatePhone = () => {
        if (!editForm.phone.trim()) {
            setErrors({ phone: ['Телефон обязателен'] });
            return;
        }

        const phoneRegex = /^\+?[0-9]+$/;
        if (!phoneRegex.test(editForm.phone.replace(/[^\d+]/g, ''))) {
            setErrors({ phone: ['Только цифры и знак +'] });
            return;
        }

        // Просто обновляем локальные данные
        const updatedData = {
            ...userData,
            phone: editForm.phone
        };
        
        setUserData(updatedData);
        saveUserData(updatedData);
        
        setSuccessMessage('Телефон успешно обновлен!');
        setEditMode('');
        setEditForm(prev => ({ ...prev, phone: '' }));
    };

    // Обновление email (локальное)
    const handleUpdateEmail = () => {
        if (!editForm.email.trim()) {
            setErrors({ email: ['Email обязателен'] });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editForm.email)) {
            setErrors({ email: ['Некорректный email'] });
            return;
        }

        // Просто обновляем локальные данные
        const updatedData = {
            ...userData,
            email: editForm.email
        };
        
        setUserData(updatedData);
        saveUserData(updatedData);
        
        setSuccessMessage('Email успешно обновлен!');
        setEditMode('');
        setEditForm(prev => ({ ...prev, email: '' }));
    };

    // Удаление объявления
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
            return;
        }

        try {
            const response = await apiRequest(`/users/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (response.data?.status === 'ok' || response.success) {
                setSuccessMessage('Объявление успешно удалено!');
                // Перезагружаем объявления и статистику
                if (userData?.id) {
                    await loadUserOrders(userData.id);
                    await updateUserStats(userData.id);
                }
            }
        } catch (error) {
            console.error('Ошибка удаления объявления:', error);
            if (error.status === 403) {
                setErrors({ 
                    general: ['Нельзя удалить объявление с текущим статусом'] 
                });
            } else {
                setErrors({ 
                    general: [error.message || 'Ошибка удаления объявления'] 
                });
            }
        }
    };

    // Кнопка обновления данных
    const handleRefreshData = () => {
        setForceRefresh(prev => prev + 1);
        setSuccessMessage('Данные обновлены!');
    };

    // Выход из системы
    const handleLogout = () => {
        clearUserData();
        navigate('/login');
    };

    // Бейдж статуса
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="badge bg-success">Активное</span>;
            case 'wasFound': return <span className="badge bg-primary">Хозяин найден</span>;
            case 'onModeration': return <span className="badge bg-warning">На модерации</span>;
            case 'archive': return <span className="badge bg-secondary">В архиве</span>;
            default: return <span className="badge bg-info">{status}</span>;
        }
    };

    if (loading || !userData) {
        return (
            <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-3">Загрузка данных пользователя...</p>
                </div>
            </div>
        );
    }

    const daysSinceRegistration = calculateDaysSinceRegistration();

    return (
        <div className="real-user-info">
            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show mb-4">
                    <i className="bi bi-check-circle me-2"></i>
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
            )}

            {errors.general && (
                <div className="alert alert-danger alert-dismissible fade show mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {Array.isArray(errors.general) ? errors.general[0] : errors.general}
                    <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                </div>
            )}

            {/* Кнопка обновления данных */}
            <div className="d-flex justify-content-end mb-3">
                <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleRefreshData}
                    disabled={ordersLoading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Обновить данные
                </button>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontSize: '2.5rem',
                                    margin: '0 auto'
                                }}>
                                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'П'}
                                </div>
                            </div>
                            <h5 className="card-title">{userData.name || 'Пользователь'}</h5>
                            <p className="text-muted mb-0">{userData.email}</p>
                            {userData.id && (
                                <p className="text-muted small mt-1">ID: {userData.id}</p>
                            )}
                            <div className="mt-4">
                                <button 
                                    className="btn btn-outline-primary btn-sm me-2 mb-2"
                                    onClick={() => {
                                        setEditMode('phone');
                                        setEditForm(prev => ({ ...prev, phone: userData.phone || '' }));
                                    }}
                                >
                                    <i className="bi bi-telephone me-1"></i>
                                    Изменить телефон
                                </button>
                                <button 
                                    className="btn btn-outline-primary btn-sm mb-2"
                                    onClick={() => {
                                        setEditMode('email');
                                        setEditForm(prev => ({ ...prev, email: userData.email || '' }));
                                    }}
                                >
                                    <i className="bi bi-envelope me-1"></i>
                                    Изменить email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Информация о пользователе
                                </h5>
                                <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handleRefreshData}
                                    disabled={ordersLoading}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted">Имя</label>
                                    <p className="fw-bold">{userData.name || 'Не указано'}</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted">Телефон</label>
                                    <p className="fw-bold">{userData.phone || 'Не указан'}</p>
                                </div>
                            </div>
                            
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted">Email</label>
                                    <p className="fw-bold">{userData.email}</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted">Дата регистрации</label>
                                    <p className="fw-bold">{userData.registrationDate || 'Неизвестно'}</p>
                                </div>
                            </div>
                            
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label text-muted">На сайте</label>
                                    <p className="fw-bold">{daysSinceRegistration} дней</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted">Статистика</label>
                                    <p className="fw-bold">
                                        {userData.ordersCount || 0} объявлений, {userData.petsCount || 0} питомцев нашли дом
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Форма редактирования телефона */}
            {editMode === 'phone' && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="card-title mb-3">Изменение номера телефона</h6>
                        <div className="mb-3">
                            <label htmlFor="editPhone" className="form-label">Новый телефон</label>
                            <input
                                type="tel"
                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                id="editPhone"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleEditChange}
                                placeholder="+79111234567"
                            />
                            {errors.phone && (
                                <div className="invalid-feedback">{errors.phone[0]}</div>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpdatePhone}
                            >
                                Сохранить
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setEditMode('');
                                    setErrors({});
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Форма редактирования email */}
            {editMode === 'email' && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="card-title mb-3">Изменение email</h6>
                        <div className="mb-3">
                            <label htmlFor="editEmail" className="form-label">Новый email</label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="editEmail"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                placeholder="new@email.com"
                            />
                            {errors.email && (
                                <div className="invalid-feedback">{errors.email[0]}</div>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpdateEmail}
                            >
                                Сохранить
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setEditMode('');
                                    setErrors({});
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Статистика */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card text-white shadow-sm" style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    }}>
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i className="bi bi-megaphone fs-1"></i>
                                </div>
                                <div>
                                    <h3 className="card-title mb-0">{userData.ordersCount || 0}</h3>
                                    <p className="card-text mb-0">Объявлений добавлено</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-success text-white shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i className="bi bi-house-heart fs-1"></i>
                                </div>
                                <div>
                                    <h3 className="card-title mb-0">{userData.petsCount || 0}</h3>
                                    <p className="card-text mb-0">Питомцев нашли дом</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Объявления пользователя */}
            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Мои объявления ({userOrders.length})
                    </h5>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleRefreshData}
                        disabled={ordersLoading}
                    >
                        {ordersLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Загрузка...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Обновить
                            </>
                        )}
                    </button>
                </div>
                <div className="card-body">
                    {ordersLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        </div>
                    ) : userOrders.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">У вас пока нет объявлений</p>
                            <a href="/add-pet" className="btn btn-primary">
                                <i className="bi bi-plus-circle me-2"></i>
                                Добавить первое объявление
                            </a>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Фото</th>
                                        <th>Вид</th>
                                        <th>Описание</th>
                                        <th>Район</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                {order.photos && (
                                                    <img 
                                                        src={`https://pets.сделай.site${order.photos}`} 
                                                        alt={order.kind}
                                                        className="img-thumbnail"
                                                        style={{ width: '60px', height: '60px' }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                                                        }}
                                                    />
                                                )}
                                            </td>
                                            <td>{order.kind}</td>
                                            <td>
                                                <small>{order.description?.substring(0, 50)}...</small>
                                            </td>
                                            <td>{order.district}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <a 
                                                        href={`/pet/${order.id}`}
                                                        className="btn btn-outline-primary"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </a>
                                                    {(order.status === 'active' || order.status === 'onModeration') && (
                                                        <>
                                                            <button 
                                                                className="btn btn-outline-warning"
                                                                onClick={() => {
                                                                    window.location.href = `/edit-pet/${order.id}`;
                                                                }}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDeleteOrder(order.id)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Кнопка выхода */}
            <div className="mt-4 text-end">
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
}

export default RealUserInfo;