import React, { useState } from "react";
import "../components/css/style.css";
function Login() {
    const [loginData, setLoginData] = useState({ identifier: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = 'https://pets.сделай.site/api';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        // Очищаем ошибки при вводе
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Определяем тип идентификатора
            const isEmail = loginData.identifier.includes('@');
            const requestData = {
                [isEmail ? 'email' : 'phone']: loginData.identifier,
                password: loginData.password
            };

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (response.status === 200) {
                const data = await response.json();
                // Сохраняем токен в localStorage
                localStorage.setItem('auth_token', data.data?.token);
                localStorage.setItem('user_email', requestData.email || '');
                
                // Перенаправляем в личный кабинет
                window.location.href = '/profile.html';
            } else if (response.status === 422 || response.status === 401) {
                const errorData = await response.json();
                setErrors(errorData.error?.errors || { general: ['Неверные данные'] });
            } else {
                setErrors({ general: ['Ошибка сервера'] });
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            setErrors({ general: ['Ошибка сети'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 80, height: 80}}>
                                    <i className="bi bi-person-fill text-white" style={{fontSize: '2rem'}} />
                                </div>
                                <h2 className="card-title">Вход в личный кабинет</h2>
                            </div>
                            <div className="alert alert-info">
                                <h6 className="alert-heading"><i className="bi bi-info-circle me-2" />Тестовые данные:</h6>
                                <p className="mb-1"><strong>Телефон:</strong> 89111234567</p>
                                <p className="mb-0"><strong>Пароль:</strong> Password123</p>
                            </div>
                            
                            {errors.general && (
                                <div className="alert alert-danger">
                                    {errors.general}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="login-phone" className="form-label">Телефон или Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-telephone-fill" /></span>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.phone || errors.email ? 'is-invalid' : ''}`}
                                            id="login-phone" 
                                            name="identifier"
                                            value={loginData.identifier}
                                            onChange={handleInputChange}
                                            placeholder="Введите телефон или email" 
                                            required 
                                            disabled={loading}
                                        />
                                    </div>
                                    {(errors.phone || errors.email) && (
                                        <div className="invalid-feedback d-block">
                                            {errors.phone?.[0] || errors.email?.[0]}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="login-password" className="form-label">Пароль</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-lock-fill" /></span>
                                        <input 
                                            type="password" 
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            id="login-password" 
                                            name="password"
                                            value={loginData.password}
                                            onChange={handleInputChange}
                                            placeholder="Введите пароль" 
                                            required 
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.password && (
                                        <div className="invalid-feedback d-block">
                                            {errors.password[0]}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mb-4 form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="remember-me" 
                                        name="remember" 
                                        disabled={loading}
                                    />
                                    <label className="form-check-label" htmlFor="remember-me">Запомнить меня</label>
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
                                                Вход...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2" />Войти
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            <div className="text-center">
                                <p>Нет аккаунта? <a href="/register.html">Зарегистрируйтесь</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;