import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveUserData, findUserByEmail } from "../utils/auth";
import "../components/css/style.css";

function LoginPage() {
  const [email, setEmail] = useState("user@user.ru");
  const [password, setPassword] = useState("paSSword1");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: ['Введите email'] });
      setLoading(false);
      return;
    }

    if (!password) {
      setErrors({ password: ['Введите пароль'] });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://pets.сделай.site/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      console.log('Статус ответа на вход:', response.status);

      if (response.ok) {
        const data = await response.json();
        const token = data.data?.token || data.token;
        
        console.log('Полный ответ от сервера:', data);

        if (token) {
          // Пробуем найти пользователя по email в списке пользователей
          let userInfo = null;
          let userId = null;
          
          try {
            const usersResponse = await fetch('https://pets.сделай.site/api/users', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });

            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              console.log('Список пользователей:', usersData);
              
              if (usersData.data?.users && Array.isArray(usersData.data.users)) {
                const currentUser = usersData.data.users.find(u => u.email === email.trim());
                if (currentUser) {
                  userInfo = currentUser;
                  userId = currentUser.id;
                  console.log('Найден пользователь:', currentUser);
                }
              }
            }
          } catch (usersError) {
            console.log('Не удалось получить список пользователей:', usersError);
          }

          // Сохраняем данные пользователя
          const userDataToSave = {
            token: token,
            email: email.trim(),
            name: userInfo?.name || email.split('@')[0],
            phone: userInfo?.phone || '',
            id: userId,
            registrationDate: userInfo?.registrationDate || '',
            ordersCount: userInfo?.ordersCount || 0,
            petsCount: userInfo?.petsCount || 0
          };

          saveUserData(userDataToSave);
          
          console.log('Вход успешен, данные сохранены:', userDataToSave);
          
          // Перенаправляем
          const params = new URLSearchParams(location.search);
          const returnUrl = params.get('return');
          navigate(returnUrl ? decodeURIComponent(returnUrl) : '/profile');
        } else {
          setErrors({ 
            general: ['Неверный ответ от сервера'] 
          });
        }
      } else if (response.status === 401 || response.status === 422) {
        const errorData = await response.json();
        console.log('Ошибка входа:', errorData);
        setErrors({ 
          general: ['Неверный email или пароль']
        });
      } else {
        const errorText = await response.text();
        console.error('Ошибка сервера при входе:', errorText);
        setErrors({ 
          general: ['Ошибка сервера. Попробуйте позже.'] 
        });
      }
    } catch (error) {
      console.error('Ошибка сети при входе:', error);
      setErrors({ 
        general: ['Ошибка сети. Проверьте подключение к интернету.'] 
      });
    } finally {
      setLoading(false);
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

              <div className="alert alert-info mb-4">
                <h6 className="alert-heading mb-2">
                  <i className="bi bi-info-circle me-2"></i>Тестовые данные:
                </h6>
                <small>
                  Email: user@user.ru<br />
                  Пароль: paSSword1
                </small>
              </div>

              {errors.general && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {Array.isArray(errors.general) ? errors.general[0] : errors.general}
                  <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    <i className="bi bi-envelope me-1"></i>Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({});
                      }}
                      placeholder="user@user.ru"
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
                    <a href="/register" className="text-decoration-none fw-semibold">
                      Зарегистрируйтесь
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

export default LoginPage;