import React, { useState } from "react";
import "../components/css/style.css";
function Registr() {
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
    const API_BASE_URL = 'https://pets.сделай.site/api';

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Очищаем ошибки при вводе
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Валидация на клиенте
    const validateForm = () => {
        const newErrors = {};

        // Валидация имени (кириллица, пробел, дефис)
        const nameRegex = /^[А-Яа-я\s-]+$/;
        if (!nameRegex.test(formData.name)) {
            newErrors.name = ['Только кириллические буквы, пробелы и дефисы'];
        }

        // Валидация телефона (только цифры и +)
        const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(formData.phone)) {
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
        if (formData.password.length < 7 || !hasUpperCase || !hasLowerCase || !hasNumbers) {
            newErrors.password = ['Минимум 7 символов, 1 цифра, 1 заглавная и 1 строчная буква'];
        }

        // Подтверждение пароля
        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = ['Пароли не совпадают'];
        }

        // Согласие на обработку данных
        if (!formData.confirm) {
            newErrors.confirm = ['Необходимо согласие на обработку данных'];
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Клиентская валидация
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    confirm: formData.confirm ? 1 : 0
                })
            });

            if (response.status === 204) {
                setSuccess(true);
                // Перенаправляем после успешной регистрации
                setTimeout(() => {
                    window.location.href = '/registration-success.html';
                }, 2000);
            } else if (response.status === 422) {
                const errorData = await response.json();
                setErrors(errorData.error?.errors || {});
            } else {
                setErrors({ general: ['Ошибка сервера'] });
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            setErrors({ general: ['Ошибка сети'] });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body p-5 text-center">
                                <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 80, height: 80}}>
                                    <i className="bi bi-check text-white" style={{fontSize: '2.5rem'}} />
                                </div>
                                <h2 className="card-title">Регистрация успешна!</h2>
                                <p className="text-success">Аккаунт успешно создан. Перенаправляем...</p>
                                <div className="spinner-border text-primary mt-3" role="status">
                                    <span className="visually-hidden">Загрузка...</span>
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
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-5">
                                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 80, height: 80}}>
                                    <i className="bi bi-person-plus text-white" style={{fontSize: '2.5rem'}} />
                                </div>
                                <h2 className="card-title">Регистрация аккаунта</h2>
                                <p className="text-muted">Создайте аккаунт для управления объявлениями о животных</p>
                            </div>

                            {errors.general && (
                                <div className="alert alert-danger">
                                    {errors.general}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="register-name" className="form-label">Имя *</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person" />
                                            </span>
                                            <input 
                                                type="text" 
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                id="register-name" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Введите ваше имя" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="invalid-feedback d-block">
                                                {errors.name[0]}
                                            </div>
                                        )}
                                        <div className="form-text">Только кириллические буквы, пробелы и дефисы</div>
                                    </div>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="register-phone" className="form-label">Телефон *</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-telephone" />
                                            </span>
                                            <input 
                                                type="tel" 
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                id="register-phone" 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+7 (900) 123-45-67" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <div className="invalid-feedback d-block">
                                                {errors.phone[0]}
                                            </div>
                                        )}
                                        <div className="form-text">Только цифры и знак +</div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="register-email" className="form-label">Email *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-envelope" />
                                        </span>
                                        <input 
                                            type="email" 
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="register-email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your@email.com" 
                                            required 
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="invalid-feedback d-block">
                                            {errors.email[0]}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="register-password" className="form-label">Пароль *</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-lock" />
                                            </span>
                                            <input 
                                                type="password" 
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="register-password" 
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Не менее 7 символов" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password[0]}
                                            </div>
                                        )}
                                        <div className="form-text">Минимум 7 символов, 1 цифра, 1 заглавная и 1 строчная буква</div>
                                    </div>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="register-password-confirmation" className="form-label">Подтверждение пароля *</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-lock-fill" />
                                            </span>
                                            <input 
                                                type="password" 
                                                className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                                id="register-password-confirmation" 
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
                                                {errors.password_confirmation[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                                            id="register-confirm" 
                                            name="confirm"
                                            checked={formData.confirm}
                                            onChange={handleInputChange}
                                            required 
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="register-confirm">
                                            Я согласен(а) с 
                                            <a href="#" className="text-decoration-none ms-1">правилами использования сервиса</a> 
                                            и 
                                            <a href="#" className="text-decoration-none ms-1">политикой конфиденциальности</a> *
                                        </label>
                                    </div>
                                    {errors.confirm && (
                                        <div className="invalid-feedback d-block">
                                            {errors.confirm[0]}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="d-grid mb-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Регистрация...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-check me-2" />Зарегистрироваться
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="text-center">
                                    <p className="mb-0">Уже есть аккаунт? 
                                        <a href="/login.html" className="text-decoration-none fw-bold ms-1">Войдите</a>
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

export default Registr;