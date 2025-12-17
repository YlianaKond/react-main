import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../components/css/style.css';

function PetDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedPets, setRelatedPets] = useState([]);
    
    const API_BASE_URL = 'https://pets.сделай.site/api';
    const BASE_IMAGE_URL = 'https://pets.сделай.site';

    useEffect(() => {
        if (id) {
            loadPetDetails();
            loadRelatedPets();
        } else {
            navigate('/search');
        }
    }, [id]);

    const loadPetDetails = async () => {
        setLoading(true);
        try {
            // Пробуем разные эндпоинты API
            const endpoints = [
                `${API_BASE_URL}/pets/${id}`,
                `${API_BASE_URL}/orders/${id}`,
                `${API_BASE_URL}/pet/${id}`
            ];
            
            let petData = null;
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Данные животного из', endpoint, ':', data);
                        
                        // Извлекаем данные из разных форматов ответа
                        petData = data.data?.pet || data.data?.order || data.data || data.pet || data.order || data;
                        if (petData) break;
                    }
                } catch (error) {
                    console.log('Ошибка загрузки из', endpoint, ':', error);
                }
            }
            
            if (petData) {
                setPet(petData);
            } else {
                // Загружаем моковые данные
                loadMockPet();
            }
        } catch (error) {
            console.error('Ошибка загрузки деталей животного:', error);
            loadMockPet();
        } finally {
            setLoading(false);
        }
    };

    const loadMockPet = () => {
        const mockPet = {
            id: id,
            kind: 'Кот',
            description: 'Рыжий кот, найден в центре города. Очень ласковый, приучен к лотку. Примерный возраст - 2 года. Имеет отличительную черту - белое пятно на груди в форме сердца.',
            district: 'Центральный',
            date: '2024-01-15T10:30:00Z',
            phone: '+79111234567',
            email: 'anna@example.com',
            name: 'Анна',
            mark: 'Чип 123456789',
            status: 'found',
            photos: [
                'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            address: 'ул. Примерная, д. 10',
            age: '2 года',
            gender: 'самец',
            vaccinated: true,
            sterilized: true
        };
        setPet(mockPet);
    };

    const loadRelatedPets = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/pets?limit=4`);
            if (response.ok) {
                const data = await response.json();
                let pets = [];
                
                if (data.data && data.data.pets) {
                    pets = data.data.pets.filter(p => p.id !== parseInt(id)).slice(0, 3);
                } else if (data.data && data.data.orders) {
                    pets = data.data.orders.filter(p => p.id !== parseInt(id)).slice(0, 3);
                }
                
                setRelatedPets(pets);
            }
        } catch (error) {
            console.error('Ошибка загрузки похожих животных:', error);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return 'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('/')) {
            return `${BASE_IMAGE_URL}${imagePath}`;
        }
        
        return `${BASE_IMAGE_URL}/${imagePath}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указана';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'found': return 'Найден';
            case 'looking_for_home': return 'Ищет дом';
            case 'lost': return 'Потерян';
            default: return 'Неизвестно';
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'found': return 'success';
            case 'looking_for_home': return 'warning';
            case 'lost': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="pet-details-page">
                <div className="container py-5">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                            <span className="visually-hidden">Загрузка...</span>
                        </div>
                        <p className="mt-3">Загрузка информации о животном...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="pet-details-page">
                <div className="container py-5">
                    <div className="alert alert-danger">
                        <h4 className="alert-heading">Объявление не найдено</h4>
                        <p>Запрошенное объявление о животном не существует или было удалено.</p>
                        <Link to="/search" className="btn btn-outline-danger">
                            Вернуться к поиску
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const photos = Array.isArray(pet.photos) ? pet.photos : 
                  pet.photo ? [pet.photo] : 
                  ['https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

    return (
        <div className="pet-details-page">
            {/* Хлебные крошки */}
            <nav aria-label="breadcrumb" className="bg-light py-3">
                <div className="container">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item">
                            <Link to="/">Главная</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/search">Поиск животных</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            {pet.kind || 'Животное'}
                        </li>
                    </ol>
                </div>
            </nav>

            <section className="pet-main py-5">
                <div className="container">
                    <div className="row">
                        {/* Галерея изображений */}
                        <div className="col-lg-7 mb-4 mb-lg-0">
                            <div className="card shadow-sm">
                                <div className="card-body p-0">
                                    <div id="petCarousel" className="carousel slide" data-bs-ride="carousel">
                                        <div className="carousel-indicators">
                                            {photos.map((_, index) => (
                                                <button 
                                                    key={index}
                                                    type="button" 
                                                    data-bs-target="#petCarousel" 
                                                    data-bs-slide-to={index} 
                                                    className={index === 0 ? "active" : ""}
                                                    aria-current={index === 0 ? "true" : "false"}
                                                    aria-label={`Slide ${index + 1}`}
                                                ></button>
                                            ))}
                                        </div>
                                        <div className="carousel-inner">
                                            {photos.map((photo, index) => (
                                                <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                                    <img 
                                                        src={getImageUrl(photo)} 
                                                        className="d-block w-100" 
                                                        alt={`${pet.kind || 'Животное'} - фото ${index + 1}`}
                                                        style={{ height: '500px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="carousel-control-prev" type="button" data-bs-target="#petCarousel" data-bs-slide="prev">
                                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span className="visually-hidden">Предыдущее</span>
                                        </button>
                                        <button className="carousel-control-next" type="button" data-bs-target="#petCarousel" data-bs-slide="next">
                                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span className="visually-hidden">Следующее</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Миниатюры */}
                            {photos.length > 1 && (
                                <div className="row mt-3 g-2">
                                    {photos.slice(0, 4).map((photo, index) => (
                                        <div key={index} className="col-3">
                                            <button 
                                                className="btn p-0 w-100"
                                                type="button"
                                                data-bs-target="#petCarousel"
                                                data-bs-slide-to={index}
                                            >
                                                <img 
                                                    src={getImageUrl(photo)} 
                                                    className="img-thumbnail"
                                                    alt={`Миниатюра ${index + 1}`}
                                                    style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Информация о животном */}
                        <div className="col-lg-5">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h1 className="card-title h2 mb-1">{pet.kind || 'Животное'}</h1>
                                            <span className={`badge bg-${getStatusClass(pet.status)}`}>
                                                {getStatusText(pet.status)}
                                            </span>
                                        </div>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            <i className="bi bi-share"></i>
                                        </button>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="card-text lead">{pet.description}</p>
                                    </div>
                                    
                                    <div className="row mb-4">
                                        <div className="col-6 mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle p-2 me-3">
                                                    <i className="bi bi-calendar text-primary"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Дата</small>
                                                    <strong>{formatDate(pet.date)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle p-2 me-3">
                                                    <i className="bi bi-geo-alt text-primary"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Район</small>
                                                    <strong>{pet.district || 'Не указан'}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        {pet.age && (
                                            <div className="col-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-3">
                                                        <i className="bi bi-clock text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">Возраст</small>
                                                        <strong>{pet.age}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {pet.gender && (
                                            <div className="col-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-3">
                                                        <i className={`bi ${pet.gender === 'самец' ? 'bi-gender-male' : 'bi-gender-female'} text-primary`}></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">Пол</small>
                                                        <strong>{pet.gender}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {pet.mark && (
                                            <div className="col-12 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-3">
                                                        <i className="bi bi-tag text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">Клеймо/чип</small>
                                                        <strong>{pet.mark}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="card bg-light border-0 mb-4">
                                        <div className="card-body">
                                            <h6 className="card-subtitle mb-3">
                                                <i className="bi bi-check-circle me-2 text-success"></i>
                                                Особенности
                                            </h6>
                                            <div className="row">
                                                <div className="col-6 mb-2">
                                                    <div className="form-check">
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            checked={pet.vaccinated || false} 
                                                            disabled 
                                                        />
                                                        <label className="form-check-label">
                                                            Вакцинирован
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-6 mb-2">
                                                    <div className="form-check">
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            checked={pet.sterilized || false} 
                                                            disabled 
                                                        />
                                                        <label className="form-check-label">
                                                            Стерилизован
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-6 mb-2">
                                                    <div className="form-check">
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            checked={true} 
                                                            disabled 
                                                        />
                                                        <label className="form-check-label">
                                                            Приучен к лотку
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-6 mb-2">
                                                    <div className="form-check">
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            checked={true} 
                                                            disabled 
                                                        />
                                                        <label className="form-check-label">
                                                            Дружелюбный
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Контактная информация */}
                                    <div className="card border-primary mb-4">
                                        <div className="card-header bg-primary text-white">
                                            <i className="bi bi-telephone me-2"></i>
                                            Контактная информация
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Контактное лицо</small>
                                                <strong>{pet.name || 'Не указано'}</strong>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Телефон</small>
                                                <strong>
                                                    <a href={`tel:${pet.phone}`} className="text-decoration-none">
                                                        {pet.phone || 'Не указан'}
                                                    </a>
                                                </strong>
                                            </div>
                                            {pet.email && (
                                                <div className="mb-3">
                                                    <small className="text-muted d-block">Email</small>
                                                    <strong>
                                                        <a href={`mailto:${pet.email}`} className="text-decoration-none">
                                                            {pet.email}
                                                        </a>
                                                    </strong>
                                                </div>
                                            )}
                                            {pet.address && (
                                                <div>
                                                    <small className="text-muted d-block">Адрес</small>
                                                    <strong>{pet.address}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="d-grid gap-2">
                                        <a href={`tel:${pet.phone}`} className="btn btn-primary btn-lg">
                                            <i className="bi bi-telephone me-2"></i>
                                            Позвонить
                                        </a>
                                        {pet.email && (
                                            <a href={`mailto:${pet.email}`} className="btn btn-outline-primary">
                                                <i className="bi bi-envelope me-2"></i>
                                                Написать на email
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Похожие животные */}
            {relatedPets.length > 0 && (
                <section className="related-pets py-5 bg-light">
                    <div className="container">
                        <h2 className="mb-4">Похожие животные</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {relatedPets.map((relatedPet) => (
                                <div key={relatedPet.id} className="col">
                                    <div className="card h-100 shadow-sm">
                                        <img 
                                            src={getImageUrl(relatedPet.photo || relatedPet.image)} 
                                            className="card-img-top" 
                                            alt={relatedPet.kind}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title">{relatedPet.kind}</h5>
                                            <p className="card-text small">
                                                {relatedPet.description && relatedPet.description.length > 80 
                                                    ? `${relatedPet.description.substring(0, 80)}...` 
                                                    : relatedPet.description}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    <i className="bi bi-geo-alt me-1"></i>
                                                    {relatedPet.district}
                                                </small>
                                                <Link to={`/pet/${relatedPet.id}`} className="btn btn-sm btn-outline-primary">
                                                    Подробнее
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4">
                            <Link to="/search" className="btn btn-primary">
                                <i className="bi bi-search me-2"></i>
                                Смотреть всех животных
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default PetDetailsPage;