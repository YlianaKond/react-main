import React, { useEffect, useState } from "react";

function Content() {
    const [recentPets, setRecentPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = 'https://pets.сделай.site/api';
    const BASE_IMAGE_URL = 'https://pets.сделай.site';

    useEffect(() => {
        loadRecentPets();
    }, []);

    const loadRecentPets = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/pets?registered=true`);
            if (response.status === 200) {
                const data = await response.json();
                if (data.data && data.data.orders) {
                    const sortedPets = [...data.data.orders]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 6);
                    setRecentPets(sortedPets);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки животных:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Сегодня';
            if (diffDays === 1) return 'Вчера';
            if (diffDays < 7) return `${diffDays} дня назад`;
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return 'Дата не указана';
        }
    };

    const getImageUrl = (photoPath) => {
        if (!photoPath) {
            return 'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
        }
        
        // Если путь уже абсолютный
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
            return photoPath;
        }
        
        // Если путь начинается с /, добавляем базовый URL
        if (photoPath.startsWith('/')) {
            return `${BASE_IMAGE_URL}${photoPath}`;
        }
        
        // Иначе добавляем базовый URL и / перед путем
        return `${BASE_IMAGE_URL}/${photoPath}`;
    };

    if (loading) {
        return (
            <div className="container my-5">
                <h2 className="section-title mb-4">Недавно найденные животные</h2>
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="section-title mb-4">Недавно найденные животные</h2>
            <div className="row g-4">
                {recentPets.length > 0 ? (
                    recentPets.map((pet) => (
                        <div key={pet.id} className="col-md-6 col-lg-4">
                            <div className="card pet-card h-100 border shadow-sm">
                                <img 
                                    src={getImageUrl(pet.photo)} 
                                    className="card-img-top" 
                                    alt={pet.kind || 'Животное'} 
                                    style={{height: 200, objectFit: 'cover'}}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
                                    }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{pet.kind || 'Не указано'}</h5>
                                    <p className="card-text flex-grow-1">
                                        {pet.description && pet.description.length > 100 
                                            ? `${pet.description.substring(0, 100)}...` 
                                            : pet.description || 'Описание отсутствует'}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <small className="text-muted">{formatDate(pet.date)}</small>
                                        <small className="text-muted">{pet.district || 'Район не указан'}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Нет недавно найденных животных
                        </div>
                    </div>
                )}
            </div>
            <div className="text-center mt-5">
                <a className="btn btn-primary btn-lg px-5" href="/search.html">
                    <i className="bi bi-search me-2"></i>Смотреть всех животных
                </a>
            </div>
        </div>
    );
}

export default Content;