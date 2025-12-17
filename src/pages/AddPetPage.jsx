// src/pages/AddPetPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import '../components/css/style.css';

function AddPetPage() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        kind: '',
        district: '',
        mark: '',
        description: '',
        register: false,
        password: '',
        password_confirmation: '',
        confirm: false
    });
    const [images, setImages] = useState([null, null, null]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const API_BASE_URL = 'https://pets.сделай.site';
    const districts = [
        'Адмиралтейский',
        'Василеостровский',
        'Выборгский',
        'Калининский',
        'Кировский',
        'Колпинский',
        'Красногвардейский',
        'Красносельский',
        'Кронштадтский',
        'Курортный',
        'Московский',
        'Невский',
        'Петроградский',
        'Петродворцовый',
        'Приморский',
        'Пушкинский',
        'Фрунзенский',
        'Центральный'
    ];

    // Проверка авторизации и автозаполнение данных
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const email = localStorage.getItem('user_email');
        
        if (token) {
            setIsAuthenticated(true);
            setUserEmail(email || '');
            
            // Автозаполнение email для авторизованных пользователей
            if (email) {
                setFormData(prev => ({ ...prev, email }));
            }
        }
    }, []);

    // Валидация формы
    const validateForm = () => {
        const newErrors = {};

        // Проверка обязательных полей
        const requiredFields = ['name', 'phone', 'email', 'kind', 'district', 'description'];
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                newErrors[field] = ['Это поле обязательно'];
            }
        });

        // Валидация имени
        const nameRegex = /^[А-Яа-яЁё\s\-]+$/;
        if (formData.name && !nameRegex.test(formData.name)) {
            newErrors.name = ['Только кириллические буквы, пробелы и дефисы'];
        }

        // Валидация телефона
        const phoneRegex = /^\+?[0-9]+$/;
        const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
        if (formData.phone && !phoneRegex.test(cleanPhone)) {
            newErrors.phone = ['Только цифры и знак +'];
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = ['Некорректный email'];
        }

        // Проверка фото1
        if (!images[0]) {
            newErrors.photo1 = ['Первое фото обязательно'];
        }

        // Проверка паролей при регистрации
        if (formData.register || (!isAuthenticated && showPasswordFields)) {
            const hasUpperCase = /[A-Z]/.test(formData.password);
            const hasLowerCase = /[a-z]/.test(formData.password);
            const hasNumbers = /\d/.test(formData.password);
            const hasMinLength = formData.password.length >= 7;
            
            if (!formData.password.trim()) {
                newErrors.password = ['Введите пароль'];
            } else if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
                newErrors.password = ['Минимум 7 символов, 1 цифра, 1 заглавная и 1 строчная буква'];
            }
            
            if (!formData.password_confirmation.trim()) {
                newErrors.password_confirmation = ['Подтвердите пароль'];
            } else if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = ['Пароли не совпадают'];
            }
        }

        // Проверка согласия
        if (!formData.confirm) {
            newErrors.confirm = ['Необходимо согласие на обработку данных'];
        }

        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name === 'register') {
            setShowPasswordFields(checked);
            setFormData(prev => ({
                ...prev,
                [name]: checked,
                password: '',
                password_confirmation: ''
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

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Проверяем формат файла
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({
                ...prev,
                [`photo${index + 1}`]: ['Формат файла должен быть JPG, JPEG, PNG или WebP']
            }));
            return;
        }
        
        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                [`photo${index + 1}`]: ['Размер файла не должен превышать 5MB']
            }));
            return;
        }
        
        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);
        
        // Создаем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            const newPreviews = [...imagePreviews];
            newPreviews[index] = e.target.result;
            setImagePreviews(newPreviews);
        };
        reader.readAsDataURL(file);
        
        // Очищаем ошибку
        if (errors[`photo${index + 1}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`photo${index + 1}`];
                return newErrors;
            });
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
        
        const newPreviews = [...imagePreviews];
        newPreviews[index] = null;
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Проверка авторизации
        if (!isAuthenticated && !formData.register) {
            setErrors({ general: ['Для добавления объявления необходимо войти в систему или зарегистрироваться'] });
            setTimeout(() => {
                navigate('/login');
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
            
            // Добавляем все обязательные поля
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('phone', formData.phone.replace(/[^\d+]/g, ''));
            formDataToSend.append('email', formData.email.trim());
            formDataToSend.append('kind', formData.kind.trim());
            formDataToSend.append('district', formData.district);
            formDataToSend.append('description', formData.description.trim());
            
            // Добавляем необязательные поля если они есть
            if (formData.mark) {
                formDataToSend.append('mark', formData.mark.trim());
            }
            
            // Добавляем файлы
            if (images[0]) formDataToSend.append('photo1', images[0]);
            if (images[1]) formDataToSend.append('photo2', images[1]);
            if (images[2]) formDataToSend.append('photo3', images[2]);
            
            // Добавляем поля для регистрации если нужно
            if (formData.register || (!isAuthenticated && showPasswordFields)) {
                formDataToSend.append('password', formData.password);
                formDataToSend.append('password_confirmation', formData.password_confirmation);
                formDataToSend.append('register', formData.register ? '1' : '0');
            }
            
            formDataToSend.append('confirm', formData.confirm ? '1' : '0');

            // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Добавляем токен авторизации
            const token = localStorage.getItem('auth_token');
            
            console.log('Отправка запроса на:', `${API_BASE_URL}/api/pets/new`);
            console.log('Токен авторизации:', token ? 'Присутствует' : 'Отсутствует');
            
            // Для отладки: покажем данные формы
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
            }

            const response = await fetch(`${API_BASE_URL}/api/pets/new`, {
                method: 'POST',
                // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Добавляем заголовок Authorization с токеном
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {},
                body: formDataToSend
            });

            console.log('Статус ответа:', response.status);

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
                    navigate('/search');
                }, 2000);
                
            } else if (response.status === 401) {
                // Не авторизован
                console.log('Ошибка 401: Неавторизованный доступ');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_email');
                setIsAuthenticated(false);
                
                setErrors({ 
                    general: ['Сессия истекла. Пожалуйста, войдите снова.'] 
                });
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                
            } else if (response.status === 422) {
                // Ошибки валидации
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
            <div className="add-pet-page">
                <Header />
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
                <Footer />
            </div>
        );
    }

    return (
        <div className="add-pet-page">
            
            
            <section className="hero-section py-5 bg-light">
                <div className="container">
                    <h1 className="display-4 fw-bold text-center mb-4">Добавить объявление о найденном животном</h1>
                </div>
            </section>
            
            <section className="form-section py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10 col-lg-8">
                            <div className="card shadow">
                                <div className="card-body p-4">
                                    <h2 className="card-title text-center mb-4">
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Добавить объявление о найденном животном
                                    </h2>
                                    
                                    {/* Информация о статусе авторизации */}
                                    {isAuthenticated ? (
                                        <div className="alert alert-info mb-4">
                                            <h6 className="alert-heading">
                                                <i className="bi bi-person-check me-2"></i>
                                                Вы авторизованы
                                            </h6>
                                            <p className="mb-0">
                                                Вы вошли как <strong>{userEmail}</strong>. Поля имя, телефон и email заполнены автоматически, но вы можете их изменить.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning mb-4">
                                            <h6 className="alert-heading">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                Вы не авторизованы
                                            </h6>
                                            <p className="mb-0">
                                                Вы можете добавить объявление с автоматической регистрацией. Отметьте опцию регистрации ниже.
                                            </p>
                                        </div>
                                    )}

                                    {errors.general && (
                                        <div className="alert alert-danger alert-dismissible fade show mb-4">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {Array.isArray(errors.general) ? errors.general[0] : errors.general}
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
                                                <label htmlFor="name" className="form-label">
                                                    Ваше имя <span className="text-danger">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                    id="name" 
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Иван Иванов" 
                                                    required 
                                                    disabled={loading}
                                                />
                                                {errors.name && (
                                                    <div className="invalid-feedback">
                                                        {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                                                    </div>
                                                )}
                                                <small className="form-text text-muted">
                                                    Только кириллические буквы, пробелы и дефисы
                                                </small>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="phone" className="form-label">
                                                    Телефон <span className="text-danger">*</span>
                                                </label>
                                                <input 
                                                    type="tel" 
                                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                    id="phone" 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+79111234567" 
                                                    required 
                                                    disabled={loading}
                                                />
                                                {errors.phone && (
                                                    <div className="invalid-feedback">
                                                        {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                                                    </div>
                                                )}
                                                <small className="form-text text-muted">
                                                    Только цифры и знак +
                                                </small>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input 
                                                type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                id="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="your@email.com" 
                                                required 
                                                disabled={loading}
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback">
                                                    {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                                                </div>
                                            )}
                                        </div>

                                        {/* Опция регистрации для неавторизованных */}
                                        {!isAuthenticated && (
                                            <div className="mb-4">
                                                <div className="form-check">
                                                    <input 
                                                        className="form-check-input"
                                                        type="checkbox" 
                                                        id="register" 
                                                        name="register"
                                                        checked={formData.register}
                                                        onChange={handleInputChange}
                                                        disabled={loading}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor="register">
                                                        Зарегистрировать меня как пользователя
                                                    </label>
                                                    <div className="form-text">
                                                        Если отмечено, будет создан аккаунт с указанными email и паролем
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Поля пароля при регистрации */}
                                        {(formData.register || (!isAuthenticated && showPasswordFields)) && (
                                            <div className="password-fields mb-4 show" id="passwordFields">
                                                <h5 className="fw-bold mb-3">Пароль для регистрации *</h5>
                                                
                                                <div className="mb-3">
                                                    <label htmlFor="password" className="form-label">Пароль</label>
                                                    <input 
                                                        type="password" 
                                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                        id="password" 
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Введите пароль"
                                                        disabled={loading}
                                                    />
                                                    {errors.password && (
                                                        <div className="invalid-feedback">
                                                            {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                                                        </div>
                                                    )}
                                                    <small className="form-text text-muted">
                                                        Минимум 7 символов, 1 цифра, 1 заглавная и 1 строчная буква
                                                    </small>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label htmlFor="password_confirmation" className="form-label">Подтверждение пароля</label>
                                                    <input 
                                                        type="password" 
                                                        className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                                        id="password_confirmation" 
                                                        name="password_confirmation"
                                                        value={formData.password_confirmation}
                                                        onChange={handleInputChange}
                                                        placeholder="Повторите пароль"
                                                        disabled={loading}
                                                    />
                                                    {errors.password_confirmation && (
                                                        <div className="invalid-feedback">
                                                            {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <h4 className="mb-3 mt-4">
                                            <i className="bi bi-paw me-2"></i>
                                            Информация о животном
                                        </h4>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="kind" className="form-label">
                                                    Вид животного <span className="text-danger">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${errors.kind ? 'is-invalid' : ''}`}
                                                    id="kind" 
                                                    name="kind"
                                                    value={formData.kind}
                                                    onChange={handleInputChange}
                                                    placeholder="Кот, собака, попугай" 
                                                    required 
                                                    disabled={loading}
                                                />
                                                {errors.kind && (
                                                    <div className="invalid-feedback">
                                                        {Array.isArray(errors.kind) ? errors.kind[0] : errors.kind}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="district" className="form-label">
                                                    Район <span className="text-danger">*</span>
                                                </label>
                                                <select 
                                                    className={`form-select ${errors.district ? 'is-invalid' : ''}`}
                                                    id="district" 
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    required 
                                                    disabled={loading}
                                                >
                                                    <option value="">Выберите район</option>
                                                    {districts.map((district, index) => (
                                                        <option key={index} value={district}>
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.district && (
                                                    <div className="invalid-feedback">
                                                        {Array.isArray(errors.district) ? errors.district[0] : errors.district}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="mark" className="form-label">
                                                Клеймо (если есть)
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                id="mark" 
                                                name="mark"
                                                value={formData.mark}
                                                onChange={handleInputChange}
                                                placeholder="Номер клейма, чипа и т.д."
                                                disabled={loading}
                                            />
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label">
                                                Описание <span className="text-danger">*</span>
                                            </label>
                                            <textarea 
                                                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                id="description" 
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
                                                    {Array.isArray(errors.description) ? errors.description[0] : errors.description}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-4">
                                            <label className="form-label">
                                                Фотографии
                                            </label>
                                            <div className="mb-3">
                                                <label htmlFor="photo1" className="form-label">
                                                    Фото 1 (обязательно) <span className="text-danger">*</span>
                                                </label>
                                                <input 
                                                    type="file" 
                                                    className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                                                    id="photo1" 
                                                    name="photo1"
                                                    onChange={(e) => handleImageChange(e, 0)}
                                                    accept=".jpg,.jpeg,.png,.webp" 
                                                    required 
                                                    disabled={loading}
                                                />
                                                {errors.photo1 && (
                                                    <div className="invalid-feedback">
                                                        {Array.isArray(errors.photo1) ? errors.photo1[0] : errors.photo1}
                                                    </div>
                                                )}
                                                <small className="form-text text-muted">
                                                    Поддерживаемые форматы: JPG, JPEG, PNG, WebP (макс. 5MB)
                                                </small>
                                            </div>
                                            
                                            <div className="mb-3">
                                                <label htmlFor="photo2" className="form-label">
                                                    Фото 2 (необязательно)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    className="form-control"
                                                    id="photo2" 
                                                    name="photo2"
                                                    onChange={(e) => handleImageChange(e, 1)}
                                                    accept=".jpg,.jpeg,.png,.webp" 
                                                    disabled={loading}
                                                />
                                            </div>
                                            
                                            <div className="mb-3">
                                                <label htmlFor="photo3" className="form-label">
                                                    Фото 3 (необязательно)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    className="form-control"
                                                    id="photo3" 
                                                    name="photo3"
                                                    onChange={(e) => handleImageChange(e, 2)}
                                                    accept=".jpg,.jpeg,.png,.webp" 
                                                    disabled={loading}
                                                />
                                            </div>

                                            {/* Превью изображений */}
                                            <div className="row mt-3">
                                                {imagePreviews.map((preview, index) => (
                                                    preview && (
                                                        <div key={index} className="col-md-4 mb-3">
                                                            <div className="position-relative">
                                                                <img 
                                                                    src={preview} 
                                                                    className="preview-image img-thumbnail w-100" 
                                                                    alt={`Preview ${index + 1}`}
                                                                    style={{ height: '150px', objectFit: 'cover' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 mt-1 me-1"
                                                                    onClick={() => removeImage(index)}
                                                                    disabled={loading}
                                                                >
                                                                    <i className="bi bi-x"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4 form-check">
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
                                                Я согласен(а) на обработку персональных данных <span className="text-danger">*</span>
                                            </label>
                                            {errors.confirm && (
                                                <div className="invalid-feedback">
                                                    {Array.isArray(errors.confirm) ? errors.confirm[0] : errors.confirm}
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
                                                        Опубликовать объявление
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
            </section>

            <Footer />
        </div>
    );
}

export default AddPetPage;