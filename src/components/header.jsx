import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './css/style.css';

function Header() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Проверяем статус авторизации при загрузке и при изменении маршрута
    useEffect(() => {
        checkAuthStatus();
    }, [location.pathname]); // Следим за изменением пути

    const checkAuthStatus = () => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token) {
            setUserLoggedIn(true);
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    setUserName(parsedData.name || parsedData.email?.split('@')[0] || 'Пользователь');
                } catch (e) {
                    setUserName('Пользователь');
                }
            } else {
                setUserName('Пользователь');
            }
        } else {
            setUserLoggedIn(false);
            setUserName('');
        }
    };

    const handleLogout = () => {
        // Очищаем все данные авторизации
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_phone');
        localStorage.removeItem('user_id');
        
        setUserLoggedIn(false);
        setUserName('');
        
        // Перенаправляем на главную страницу
        navigate('/');
        
        // Обновляем страницу для сброса состояния
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleProfileClick = (e) => {
        // Если пользователь не авторизован, показываем сообщение
        if (!userLoggedIn) {
            e.preventDefault();
            alert('Для доступа к личному кабинету необходимо войти в систему.');
            navigate('/login');
        }
    };

    return (
        <header className="header">
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <i className="bi bi-heart-fill text-danger me-2"></i>
                        <span className="fw-bold">Любимые питомцы</span>
                    </Link>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    <i className="bi bi-house-door me-1"></i>
                                    Главная
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/search">
                                    <i className="bi bi-search me-1"></i>
                                    Поиск животных
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/add-pet">
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Добавить объявление
                                </Link>
                            </li>
                        </ul>
                        
                        <div className="d-flex align-items-center">
                            {userLoggedIn ? (
                                <>
                                    <div className="dropdown me-3">
                                        <button className="btn btn-outline-primary dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                                            <i className="bi bi-person-circle me-2"></i>
                                            <span className="d-none d-md-inline">{userName}</span>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li>
                                                <Link className="dropdown-item" to="/profile">
                                                    <i className="bi bi-person me-2"></i>
                                                    Личный кабинет
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/add-pet">
                                                    <i className="bi bi-plus-circle me-2"></i>
                                                    Добавить объявление
                                                </Link>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                                    <i className="bi bi-box-arrow-right me-2"></i>
                                                    Выйти
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-outline-primary me-2">
                                        <i className="bi bi-box-arrow-in-right me-1"></i>
                                        Войти
                                    </Link>
                                    <Link to="/register" className="btn btn-primary">
                                        <i className="bi bi-person-plus me-1"></i>
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;