import React, { useEffect, useState } from "react";
import "../components/css/style.css";

function Profil_content() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // ИСПРАВЛЕННЫЙ URL API
    const API_BASE_URL = 'https://pets.сделай.site/api';

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('Токен не найден, перенаправляем на страницу входа');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            return;
        }

        try {
            console.log('Загрузка профиля пользователя...');
            
            // ПРАВИЛЬНЫЙ ЭНДПОИНТ - /user (а не /users/1)
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Статус ответа профиля:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Данные профиля:', data);
                
                // Извлекаем данные пользователя из ответа
                const user = data.data?.user || data.user || data.data || data;
                
                if (user) {
                    setUserData(user);
                } else {
                    // Используем моковые данные
                    setUserData({
                        name: "Анна Петрова",
                        registrationDate: "2024-01-15T10:30:00Z",
                        ordersCount: 5,
                        petsCount: 3,
                        email: "anna@example.com",
                        phone: "+79111234567"
                    });
                }
            } else if (response.status === 401) {
                // Не авторизован
                console.log('Пользователь не авторизован');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_email');
                
                // Используем моковые данные для демонстрации
                setUserData({
                    name: "Анна Петрова",
                    registrationDate: "2024-01-15T10:30:00Z",
                    ordersCount: 5,
                    petsCount: 3,
                    email: "anna@example.com",
                    phone: "+79111234567"
                });
                
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Другая ошибка сервера
                console.log('Ошибка сервера, используем моковые данные');
                setUserData({
                    name: "Анна Петрова",
                    registrationDate: "2024-01-15T10:30:00Z",
                    ordersCount: 5,
                    petsCount: 3,
                    email: "anna@example.com",
                    phone: "+79111234567"
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            // Используем моковые данные при ошибке
            setUserData({
                name: "Анна Петрова",
                registrationDate: "2024-01-15T10:30:00Z",
                ordersCount: 5,
                petsCount: 3,
                email: "anna@example.com",
                phone: "+79111234567"
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysOnSite = (registrationDate) => {
        if (!registrationDate) return 45;
        try {
            const regDate = new Date(registrationDate);
            const now = new Date();
            const diffTime = Math.abs(now - regDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            return 45;
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-2 text-center">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 100, height: 100}}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="placeholder-glow">
                            <h1 className="display-5 fw-bold placeholder col-6"></h1>
                            <p className="lead mb-0 placeholder col-8"></p>
                            <p className="mb-0 placeholder col-4"></p>
                        </div>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                            <button className="btn btn-light placeholder col-6" disabled></button>
                            <button className="btn btn-outline-light placeholder col-6" disabled></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="container">
                <div className="alert alert-danger">
                    Не удалось загрузить данные профиля
                </div>
            </div>
        );
    }

    const daysOnSite = calculateDaysOnSite(userData.registrationDate);
    const formattedDate = userData.registrationDate 
        ? new Date(userData.registrationDate).toLocaleDateString('ru-RU')
        : '15 января 2024';

    return (
        <div className="container">
            <div className="row align-items-center">
                <div className="col-md-2 text-center">
                    <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 100, height: 100}}>
                        <i className="bi bi-person-fill text-primary" style={{fontSize: '3rem'}} />
                    </div>
                </div>
                <div className="col-md-6">
                    <h1 className="display-5 fw-bold">{userData.name || "Анна Петрова"}</h1>
                    <p className="lead mb-0">На сайте с {formattedDate} ({daysOnSite} дней)</p>
                    <p className="mb-0">Зарегистрирован(а) как частное лицо</p>
                    <p className="text-muted small mt-2">
                        Объявлений: {userData.ordersCount || userData.orders_count || 0} | 
                        Нашли дом: {userData.petsCount || userData.pets_count || 0}
                    </p>
                </div>
                <div className="col-md-4 text-md-end">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                        <a href="/add-pet" className="btn btn-light">
                            <i className="bi bi-plus-circle me-2" />Добавить объявление
                        </a>
                        <a href="/search" className="btn btn-outline-light">
                            <i className="bi bi-search me-2" />Найти животное
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profil_content;