import React, { useState } from "react";

function NewsletterSubscription() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    
    const API_BASE_URL = 'https://pets.сделай.site/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Валидация email на клиенте
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setError("Пожалуйста, введите email адрес");
            return;
        }
        
        if (!emailRegex.test(email)) {
            setError("Введите корректный email адрес");
            return;
        }

        setLoading(true);
        setError("");

        try {
            console.log("Отправляем запрос на подписку с email:", email);
            
            const response = await fetch(`${API_BASE_URL}/subscription`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() })
            });

            console.log("Статус ответа:", response.status);
            console.log("Заголовки ответа:", response.headers);

            // Получаем текст ответа для отладки
            const responseText = await response.text();
            console.log("Текст ответа:", responseText);

            let errorData = null;
            try {
                if (responseText) {
                    errorData = JSON.parse(responseText);
                    console.log("Парсинг JSON успешен:", errorData);
                }
            } catch (jsonError) {
                console.log("Не удалось распарсить JSON:", responseText);
            }

            if (response.status === 200) {
                console.log("Подписка успешна!");
                setSuccess(true);
                setEmail("");
                
                // Сбрасываем успешное сообщение через 5 секунд
                setTimeout(() => {
                    setSuccess(false);
                }, 5000);
                
            } else if (response.status === 204) {
                console.log("Подписка успешна (статус 204)");
                setSuccess(true);
                setEmail("");
                
                setTimeout(() => {
                    setSuccess(false);
                }, 5000);
                
            } else if (response.status === 422) {
                console.log("Ошибка валидации:", errorData);
                const errorMessage = errorData?.error?.errors?.email?.[0] 
                    || errorData?.error?.message 
                    || 'Ошибка валидации данных';
                setError(errorMessage);
                
            } else if (response.status === 400) {
                console.log("Ошибка 400:", errorData);
                const errorMessage = errorData?.error?.message 
                    || 'Некорректный запрос';
                setError(errorMessage);
                
            } else if (response.status === 401) {
                setError("Требуется авторизация");
                
            } else if (response.status === 403) {
                setError("Доступ запрещен");
                
            } else if (response.status === 404) {
                setError("Сервис подписки не найден");
                
            } else if (response.status >= 500) {
                setError("Ошибка сервера. Попробуйте позже.");
                
            } else {
                console.log("Неизвестный статус:", response.status, errorData);
                const errorMessage = errorData?.error?.message 
                    || `Ошибка ${response.status}. Попробуйте позже.`;
                setError(errorMessage);
            }
            
        } catch (error) {
            console.error('Ошибка сети при подписке:', error);
            setError("Ошибка сети. Проверьте подключение к интернету.");
        } finally {
            setLoading(false);
        }
    };

    // Стилизованный вариант с улучшенным UI
    return (
        <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body p-4 text-white">
                <h5 className="card-title mb-3">
                    <i className="bi bi-envelope-heart me-2"></i>
                    Подписка на новости
                </h5>
                
                {success ? (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill fs-4 me-3"></i>
                            <div>
                                <h6 className="alert-heading mb-1">Успешно!</h6>
                                <p className="mb-0">Вы успешно подписались на наши новости</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
                    </div>
                ) : (
                    <>
                        <p className="card-text mb-3 opacity-75">
                            Будьте первыми, кто узнает о новых найденных животных в вашем районе
                        </p>
                        
                        {error && (
                            <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    <span>{error}</span>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setError("")}></button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-white border-0">
                                    <i className="bi bi-envelope text-primary"></i>
                                </span>
                                <input 
                                    type="email" 
                                    className="form-control border-0" 
                                    placeholder="Ваш email" 
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(""); // Сбрасываем ошибку при вводе
                                    }}
                                    required
                                    disabled={loading}
                                    style={{ 
                                        borderRadius: '0.375rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <button 
                                    className="btn btn-light" 
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    style={{ 
                                        borderRadius: '0.375rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Отправка...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send me-2"></i>
                                            Подписаться
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="form-check mb-3">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="privacyPolicy" 
                                    required
                                />
                                <label className="form-check-label opacity-75" htmlFor="privacyPolicy">
                                    <small>
                                        Соглашаюсь с обработкой персональных данных и 
                                        <a href="#" className="text-white text-decoration-underline ms-1">политикой конфиденциальности</a>
                                    </small>
                                </label>
                            </div>
                            
                            <div className="mt-3">
                                <small className="opacity-75 d-block">
                                    <i className="bi bi-shield-check me-1"></i>
                                    Без спама. Отписаться можно в любой момент
                                </small>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default NewsletterSubscription;