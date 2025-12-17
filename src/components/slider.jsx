import React, { useEffect, useState } from "react";

function Slider() {
    const [sliderPets, setSliderPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = 'https://pets.сделай.site/api';
    const BASE_IMAGE_URL = 'https://pets.сделай.site';

    useEffect(() => {
        loadSliderPets();
    }, []);

    const loadSliderPets = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/pets/slider`);
            if (response.status === 200) {
                const data = await response.json();
                if (data.data && data.data.pets && data.data.pets.length > 0) {
                    setSliderPets(data.data.pets);
                } else {
                    // Проверяем пустой эндпоинт
                    try {
                        await fetch(`${API_BASE_URL}/pets/slider/empty`);
                        // Если пусто, слайдер не показываем
                    } catch (error) {
                        console.log('Пустой слайдер не поддерживается');
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки слайдера:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
        }
        
        // Если путь уже абсолютный
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Если путь начинается с /, добавляем базовый URL
        if (imagePath.startsWith('/')) {
            return `${BASE_IMAGE_URL}${imagePath}`;
        }
        
        // Иначе добавляем базовый URL и / перед путем
        return `${BASE_IMAGE_URL}/${imagePath}`;
    };

    if (loading) {
        return (
            <div className="container">
                <h2 className="section-title">Питомцы, которые нашли дом</h2>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (sliderPets.length === 0) {
        return null; // Не отображаем блок, если нет данных
    }

    return (
        <div className="container">
            <h2 className="section-title">Питомцы, которые нашли дом</h2>
            <div id="success-stories-slider" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    {sliderPets.map((_, index) => (
                        <button 
                            key={index}
                            type="button" 
                            data-bs-target="#success-stories-slider" 
                            data-bs-slide-to={index} 
                            className={index === 0 ? "active" : ""}
                        />
                    ))}
                </div>
                <div className="carousel-inner rounded shadow">
                    {sliderPets.map((pet, index) => (
                        <div key={pet.id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                            <div className="row align-items-center bg-light p-4" style={{minHeight: '400px'}}>
                                <div className="col-md-6">
                                    <img 
                                        src={getImageUrl(pet.image)} 
                                        className="d-block w-100 rounded" 
                                        alt={pet.kind || 'Питомец'} 
                                        style={{maxHeight: '350px', objectFit: 'cover'}}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <div className="p-4">
                                        <h3 className="text-primary">{pet.kind || 'Питомец'}</h3>
                                        <p className="lead">{pet.description || 'Описание отсутствует'}</p>
                                        <div className="d-flex align-items-center mt-4">
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 50, height: 50}}>
                                                <i className="bi bi-person-fill text-white" />
                                            </div>
                                            <div>
                                                <strong>Нашедший</strong>
                                                <p className="mb-0 text-muted">питомца</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#success-stories-slider" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Предыдущий</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#success-stories-slider" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Следующий</span>
                </button>
            </div>
        </div>
    );
}

export default Slider;