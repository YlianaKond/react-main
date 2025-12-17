import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/css/style.css";

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        password_confirmation: "",
        confirm: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    
    // ПРАВИЛЬНЫЙ URL API
    const API_BASE_URL = 'https://pets.сделай.site/api';

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Валидация на клиенте
    const validateForm = () => {
        const newErrors = {};

        // Валидация имени (кириллица, пробел, дефис)
        const nameRegex = /^[А-Яа-яЁё\s\-]+$/;
        if (!nameRegex.test(formData.name.trim())) {
            newErrors.name = ['Только кириллические буквы, пробелы и дефисы'];
        }

        // Валидация телефона (только цифры и +)
        const phoneRegex = /^\+?[0-9]+$/;
        const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            newErrors.phone = ['Только цифры и знак +'];
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = ['Некорректный email'];
        }

        // Валидация пароля
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumbers = /\d/.test(formData.password);
        const hasMinLength = formData.password.length >= 7;
        
        if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
            newErrors.password = ['Минимум 7 символов, 1 цифра, 1 заглавная и 1 строчная буква'];
        }

        // Подтверждение пароля
        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = ['Пароли не совпадают'];
        }

        // Согласие
        if (!formData.confirm) {
            newErrors.confirm = ['Необходимо согласие на обработку данных'];
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Отправка данных регистрации...');
        
        // Сначала клиентская валидация
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            console.log('Ошибки валидации:', validationErrors);
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Подготовка данных для отправки
            const dataToSend = {
                name: formData.name.trim(),
                phone: formData.phone.replace(/[^\d+]/g, ''),
                email: formData.email.trim(),
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                confirm: formData.confirm ? 1 : 0
            };

            console.log('Отправка данных:', dataToSend);

            // Используем прямой fetch
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            console.log('Статус ответа:', response.status);
            
            const responseText = await response.text();
            console.log('Текст ответа:', responseText);
            
            let data = {};
            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                    console.log('Парсинг JSON успешен:', data);
                }
            } catch (jsonError) {
                console.log('Ошибка парсинга JSON:', jsonError);
            }

            if (response.ok || response.status === 204) {
                console.log('Регистрация успешна!');
                setSuccess(true);
                
                // Автоматический вход после регистрации
                setTimeout(() => {
                    navigate('/login.html');
                }, 2000);

            } else if (response.status === 422) {
                console.log('Ошибка валидации:', data);
                // Обработка ошибок от сервера
                if (data.error?.errors) {
                    setErrors(data.error.errors);
                } else if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ 
                        general: ['Ошибка валидации данных'] 
                    });
                }
            } else {
                console.log('Другая ошибка:', data);
                setErrors({ 
                    general: [data.message || `Ошибка ${response.status}. Попробуйте позже.`] 
                });
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ 
                general: ['Ошибка сети. Проверьте подключение к интернету.'] 
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5 text-center">
                                <div className="mb-4">
                                    <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style={{width: 100, height: 100}}>
                                        <i className="bi bi-check-lg text-white fs-1"></i>
                                    </div>
                                </div>
                                <h2 className="card-title fw-bold mb-3">Регистрация успешна!</h2>
                                <p className="text-muted mb-4">Аккаунт успешно создан. Теперь вы можете войти в систему.</p>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Перенаправление...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                     style={{width: 70, height: 70}}>
                                    <i className="bi bi-person-plus text-white fs-3"></i>
                                </div>
                                <h2 className="card-title fw-bold">Регистрация аккаунта</h2>
                                <p className="text-muted">Создайте аккаунт для управления объявлениями</p>
                            </div>

                            {errors.general && (
                                <div className="alert alert-danger alert-dismissible fade show">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {errors.general[0] || errors.general}
                                    <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="name" className="form-label fw-semibold">
                                            <i className="bi bi-person me-1"></i>Имя *
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person-badge"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Иван"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="invalid-feedback d-block">
                                                {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                                            </div>
                                        )}
                                        <small className="form-text text-muted">
                                            Только кириллические буквы, пробелы и дефисы
                                        </small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="phone" className="form-label fw-semibold">
                                            <i className="bi bi-telephone me-1"></i>Телефон *
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-phone"></i>
                                            </span>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="89111234567"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <div className="invalid-feedback d-block">
                                                {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                                            </div>
                                        )}
                                        <small className="form-text text-muted">
                                            Только цифры (можно без +7)
                                        </small>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">
                                        <i className="bi bi-envelope me-1"></i>Email *
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-at"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="user@example.com"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="invalid-feedback d-block">
                                            {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="password" className="form-label fw-semibold">
                                            <i className="bi bi-lock me-1"></i>Пароль *
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-key"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Минимум 7 символов"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                                            </div>
                                        )}
                                        <small className="form-text text-muted">
                                            Минимум 7 символов, 1 цифра, 1 заглавная и 1 строчная буква
                                        </small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="password_confirmation" className="form-label fw-semibold">
                                            <i className="bi bi-lock-fill me-1"></i>Подтверждение пароля *
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-key-fill"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                placeholder="Повторите пароль"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.password_confirmation && (
                                            <div className="invalid-feedback d-block">
                                                {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                                            id="confirm"
                                            name="confirm"
                                            checked={formData.confirm}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="confirm">
                                            Я согласен(а) с{' '}
                                            <a href="#" className="text-decoration-none">правилами использования сервиса</a>{' '}
                                            и{' '}
                                            <a href="#" className="text-decoration-none">политикой конфиденциальности</a> *
                                        </label>
                                        {errors.confirm && (
                                            <div className="invalid-feedback d-block">
                                                {Array.isArray(errors.confirm) ? errors.confirm[0] : errors.confirm}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="d-grid mb-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Регистрация...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-check me-2"></i>
                                                Зарегистрироваться
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <p className="mb-0">
                                        Уже есть аккаунт?{' '}
                                        <a href="/login.html" className="text-decoration-none fw-semibold">
                                            Войдите
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;