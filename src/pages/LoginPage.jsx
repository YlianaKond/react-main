import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/css/style.css";

function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const API_BASE_URL = 'https://pets.сделай.site/api';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('return');
    if (returnUrl) {
      // Можно сохранить returnUrl для редиректа после входа
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!identifier.trim()) {
      setErrors({ identifier: ['Введите телефон или email'] });
      setLoading(false);
      return;
    }

    if (!password) {
      setErrors({ password: ['Введите пароль'] });
      setLoading(false);
      return;
    }

    try {
      // Определяем тип идентификатора
      const isEmail = identifier.includes('@');
      const requestData = {
        [isEmail ? 'email' : 'phone']: identifier,
        password: password
      };

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const token = data.data?.token || data.token;
        
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_email', identifier);
          
          console.log('Login successful, token saved');
          
          // Перенаправляем в профиль или на предыдущую страницу
          const params = new URLSearchParams(location.search);
          const returnUrl = params.get('return');
          navigate(returnUrl ? decodeURIComponent(returnUrl) : '/profile.html');
        } else {
          setErrors({ 
            general: ['Неверный ответ от сервера'] 
          });
        }
      } else if (response.status === 422 || response.status === 401) {
        const data = await response.json();
        console.log('Login error data:', data);
        setErrors({ 
          general: ['Неверный телефон/email или пароль'],
          password: ['Неверный пароль'] 
        });
      } else {
        setErrors({ 
          general: ['Ошибка сервера'] 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: ['Ошибка сети. Проверьте подключение к интернету.'] 
      });
    } finally {
      setLoading(false);
    }
  };

  // Тестовые данные для быстрого входа
  const handleTestLogin = (type) => {
    if (type === 'phone') {
      setIdentifier('89111234567');
      setPassword('Password123');
    } else {
      setIdentifier('user@user.ru');
      setPassword('paSSword1');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{width: 70, height: 70}}>
                  <i className="bi bi-person-fill text-white fs-3"></i>
                </div>
                <h2 className="card-title fw-bold">Вход в систему</h2>
                <p className="text-muted">Войдите в свой аккаунт</p>
              </div>

              {/* Тестовые данные */}
              <div className="alert alert-info mb-4">
                <h6 className="alert-heading mb-2">
                  <i className="bi bi-info-circle me-2"></i>Тестовые данные:
                </h6>
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleTestLogin('phone')}
                    disabled={loading}
                    type="button"
                  >
                    <i className="bi bi-phone me-1"></i>Телефон
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleTestLogin('email')}
                    disabled={loading}
                    type="button"
                  >
                    <i className="bi bi-envelope me-1"></i>Email
                  </button>
                </div>
              </div>

              {errors.general && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.general[0] || errors.general}
                  <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="identifier" className="form-label fw-semibold">
                    <i className="bi bi-person-circle me-1"></i>Телефон или Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-telephone-fill"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
                      id="identifier"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errors.identifier) setErrors({});
                      }}
                      placeholder="89111234567 или user@user.ru"
                      required
                      disabled={loading}
                    />
                  </div>
                  {errors.identifier && (
                    <div className="invalid-feedback d-block">
                      {errors.identifier[0]}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">
                    <i className="bi bi-lock-fill me-1"></i>Пароль
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-key-fill"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({});
                      }}
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
                    id="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Запомнить меня
                  </label>
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
                        Вход...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Войти
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="mb-2">
                    Нет аккаунта?{' '}
                    <a href="/register.html" className="text-decoration-none fw-semibold">
                      Зарегистрируйтесь
                    </a>
                  </p>
                  <a href="#" className="text-decoration-none small text-muted">
                    <i className="bi bi-question-circle me-1"></i>
                    Забыли пароль?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;