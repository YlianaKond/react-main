import React, { useState, useEffect } from "react";
import "../components/css/style.css";

function Info() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        kind: "",
        district: "",
        mark: "",
        description: "",
        photo1: null,
        photo2: null,
        photo3: null,
        confirm: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    
    // ПРАВИЛЬНЫЙ URL API
    const API_BASE_URL = 'https://pets.сделай.site/api';

    // Автозаполнение для авторизованных пользователей
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            const userEmail = localStorage.getItem('user_email');
            if (userEmail) {
                setFormData(prev => ({ ...prev, email: userEmail }));
            }
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] || null
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleRegisterChange = (e) => {
        setShowPasswordFields(e.target.checked);
    };

    const validateForm = () => {
        const newErrors = {};

        // Проверка обязательных полей
        const requiredFields = ['name', 'phone', 'email', 'kind', 'district', 'description'];
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                newErrors[field] = ['Это поле обязательно'];
            }
        });

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = ['Некорректный email'];
        }

        // Валидация телефона
        const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = ['Некорректный формат телефона'];
        }

        // Проверка фото1
        if (!formData.photo1) {
            newErrors.photo1 = ['Первое фото обязательно'];
        }

        // Проверка согласия
        if (!formData.confirm) {
            newErrors.confirm = ['Необходимо согласие на обработку данных'];
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Проверка авторизации
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setErrors({ general: ['Для добавления объявления необходимо войти в систему'] });
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        // Клиентская валидация
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();
            
            // Добавляем все поля в FormData
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('phone', formData.phone.replace(/[^\d+]/g, ''));
            formDataToSend.append('email', formData.email.trim());
            formDataToSend.append('kind', formData.kind.trim());
            formDataToSend.append('district', formData.district);
            formDataToSend.append('description', formData.description.trim());
            
            if (formData.mark) {
                formDataToSend.append('mark', formData.mark.trim());
            }
            
            if (formData.photo1) {
                formDataToSend.append('photo1', formData.photo1);
            }
            
            if (formData.photo2) {
                formDataToSend.append('photo2', formData.photo2);
            }
            
            if (formData.photo3) {
                formDataToSend.append('photo3', formData.photo3);
            }
            
            formDataToSend.append('confirm', formData.confirm ? '1' : '0');

            console.log('Отправка запроса на:', `${API_BASE_URL}/pets/new`);
            console.log('Токен авторизации:', token ? 'Присутствует' : 'Отсутствует');
            
            // Для отладки покажем данные формы
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await fetch(`${API_BASE_URL}/pets/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // НЕ добавляем Content-Type для FormData - браузер сам установит
                },
                body: formDataToSend
            });

            console.log('Статус ответа:', response.status);
            console.log('Заголовки ответа:', response.headers);

            // Пытаемся прочитать ответ
            let responseText = '';
            try {
                responseText = await response.text();
                console.log('Текст ответа:', responseText);
            } catch (textError) {
                console.log('Не удалось прочитать текст ответа');
            }

            if (response.ok) {
                console.log('Объявление успешно добавлено!');
                setSuccess(true);
                
                // Перенаправляем после успешного добавления
                setTimeout(() => {
                    window.location.href = '/search';
                }, 2000);
                
            } else if (response.status === 401) {
                // Не авторизован
                console.log('Ошибка 401: Неавторизованный доступ');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_email');
                
                setErrors({ 
                    general: ['Сессия истекла. Пожалуйста, войдите снова.'] 
                });
                
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                
            } else if (response.status === 404) {
                // Эндпоинт не найден
                console.log('Ошибка 404: Эндпоинт не найден');
                setErrors({ 
                    general: ['Сервис добавления объявлений временно недоступен. Попробуйте позже.'] 
                });
                
            } else if (response.status === 422) {
                // Ошибки валидации
                console.log('Ошибка 422: Ошибки валидации');
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('Данные ошибок:', errorData);
                    setErrors(errorData.errors || errorData.error?.errors || {});
                } catch (parseError) {
                    setErrors({ 
                        general: ['Ошибка валидации данных'] 
                    });
                }
                
            } else {
                // Другая ошибка сервера
                console.log('Другая ошибка сервера');
                setErrors({ 
                    general: [`Ошибка сервера ${response.status}. Попробуйте позже.`] 
                });
            }
            
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
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
                    <div className="col-md-8">
                        <div className="alert alert-success text-center">
                            <h4 className="alert-heading">Объявление успешно добавлено!</h4>
                            <p>Перенаправляем на страницу поиска...</p>
                            <div className="spinner-border text-success mt-2" role="status">
                                <span className="visually-hidden">Загрузка...</span>
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
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">
                                <i className="bi bi-plus-circle me-2"></i>
                                Добавить объявление о найденном животном
                            </h2>
                            
                            <div className="alert alert-info">
                                <h6 className="alert-heading">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Информация:
                                </h6>
                                <p className="mb-0">
                                    API: {API_BASE_URL}/pets/new
                                </p>
                            </div>

                            {errors.general && (
                                <div className="alert alert-danger alert-dismissible fade show">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {errors.general}
                                    <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                <h4 className="mb-3">
                                    <i className="bi bi-person me-2"></i>
                                    Контактная информация
                                </h4>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="pet-name" className="form-label">
                                            Ваше имя <span className="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            id="pet-name" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Иван Иванов" 
                                            required 
                                            disabled={loading}
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">
                                                {errors.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="pet-phone" className="form-label">
                                            Телефон <span className="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="tel" 
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            id="pet-phone" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+79111234567" 
                                            required 
                                            disabled={loading}
                                        />
                                        {errors.phone && (
                                            <div className="invalid-feedback">
                                                {errors.phone[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="pet-email" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="pet-email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com" 
                                        required 
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email[0]}
                                        </div>
                                    )}
                                </div>

                                <h4 className="mb-3 mt-4">
                                    <i className="bi bi-paw me-2"></i>
                                    Информация о животном
                                </h4>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="pet-kind" className="form-label">
                                            Вид животного <span className="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.kind ? 'is-invalid' : ''}`}
                                            id="pet-kind" 
                                            name="kind"
                                            value={formData.kind}
                                            onChange={handleInputChange}
                                            placeholder="Кот, собака, попугай" 
                                            required 
                                            disabled={loading}
                                        />
                                        {errors.kind && (
                                            <div className="invalid-feedback">
                                                {errors.kind[0]}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="pet-district" className="form-label">
                                            Район <span className="text-danger">*</span>
                                        </label>
                                        <select 
                                            className={`form-select ${errors.district ? 'is-invalid' : ''}`}
                                            id="pet-district" 
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            required 
                                            disabled={loading}
                                        >
                                            <option value="">Выберите район</option>
                                            <option value="Адмиралтейский">Адмиралтейский</option>
                                            <option value="Василеостровский">Василеостровский</option>
                                            <option value="Выборгский">Выборгский</option>
                                            <option value="Калининский">Калининский</option>
                                            <option value="Кировский">Кировский</option>
                                            <option value="Колпинский">Колпинский</option>
                                            <option value="Красногвардейский">Красногвардейский</option>
                                            <option value="Красносельский">Красносельский</option>
                                            <option value="Кронштадтский">Кронштадтский</option>
                                            <option value="Курортный">Курортный</option>
                                            <option value="Московский">Московский</option>
                                            <option value="Невский">Невский</option>
                                            <option value="Петроградский">Петроградский</option>
                                            <option value="Петродворцовый">Петродворцовый</option>
                                            <option value="Приморский">Приморский</option>
                                            <option value="Пушкинский">Пушкинский</option>
                                            <option value="Фрунзенский">Фрунзенский</option>
                                            <option value="Центральный">Центральный</option>
                                        </select>
                                        {errors.district && (
                                            <div className="invalid-feedback">
                                                {errors.district[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="pet-mark" className="form-label">
                                        Клеймо (если есть)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        id="pet-mark" 
                                        name="mark"
                                        value={formData.mark}
                                        onChange={handleInputChange}
                                        placeholder="Номер клейма, чипа и т.д."
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="pet-description" className="form-label">
                                        Описание <span className="text-danger">*</span>
                                    </label>
                                    <textarea 
                                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                        id="pet-description" 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4} 
                                        placeholder="Опишите животное: порода, окрас, особые приметы, где найдено..."
                                        required 
                                        disabled={loading}
                                    />
                                    {errors.description && (
                                        <div className="invalid-feedback">
                                            {errors.description[0]}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label">
                                        Фотографии
                                    </label>
                                    <div className="mb-3">
                                        <label htmlFor="pet-photo1" className="form-label">
                                            Фото 1 (обязательно) <span className="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="file" 
                                            className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                                            id="pet-photo1" 
                                            name="photo1"
                                            onChange={handleInputChange}
                                            accept=".jpg,.jpeg,.png,.webp" 
                                            required 
                                            disabled={loading}
                                        />
                                        {errors.photo1 && (
                                            <div className="invalid-feedback">
                                                {errors.photo1[0]}
                                            </div>
                                        )}
                                        <small className="form-text text-muted">
                                            Поддерживаемые форматы: JPG, JPEG, PNG, WebP
                                        </small>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label htmlFor="pet-photo2" className="form-label">
                                            Фото 2 (необязательно)
                                        </label>
                                        <input 
                                            type="file" 
                                            className="form-control"
                                            id="pet-photo2" 
                                            name="photo2"
                                            onChange={handleInputChange}
                                            accept=".jpg,.jpeg,.png,.webp" 
                                            disabled={loading}
                                        />
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label htmlFor="pet-photo3" className="form-label">
                                            Фото 3 (необязательно)
                                        </label>
                                        <input 
                                            type="file" 
                                            className="form-control"
                                            id="pet-photo3" 
                                            name="photo3"
                                            onChange={handleInputChange}
                                            accept=".jpg,.jpeg,.png,.webp" 
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-4 form-check">
                                    <input 
                                        type="checkbox" 
                                        className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                                        id="pet-confirm" 
                                        name="confirm"
                                        checked={formData.confirm}
                                        onChange={handleInputChange}
                                        required 
                                        disabled={loading}
                                    />
                                    <label className="form-check-label" htmlFor="pet-confirm">
                                        Я согласен(а) на обработку персональных данных <span className="text-danger">*</span>
                                    </label>
                                    {errors.confirm && (
                                        <div className="invalid-feedback">
                                            {errors.confirm[0]}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="d-grid">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Отправка...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-cloud-upload me-2"></i>
                                                Добавить объявление
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Info;