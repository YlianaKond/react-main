import React, { useState, useRef } from "react";

function Content1() {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimer = useRef(null);
    const API_BASE_URL = 'https://pets.сделай.site/api';

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        clearTimeout(debounceTimer.current);
        
        if (value.length >= 3) {
            debounceTimer.current = setTimeout(async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(value)}`);
                    if (response.status === 200) {
                        const data = await response.json();
                        setSuggestions(data.data?.orders || []);
                        setShowSuggestions(true);
                    } else if (response.status === 204) {
                        setSuggestions([]);
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error('Ошибка поиска:', error);
                }
            }, 1000);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            window.location.href = `/search.html?query=${encodeURIComponent(searchQuery)}`;
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handleSuggestionClick = (order) => {
        if (order && order.id) {
            window.location.href = `/pet-details.html?id=${order.id}`;
        }
    };

    // Функция для получения URL изображения
    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('/')) {
            return `https://pets.сделай.site${imagePath}`;
        }
        
        return `https://pets.сделай.site/${imagePath}`;
    };

    // Функция для получения URL изображения из подсказок
    const getSuggestionImageUrl = (order) => {
        if (order.photos) {
            if (Array.isArray(order.photos) && order.photos.length > 0) {
                return getImageUrl(order.photos[0]);
            }
            if (typeof order.photos === 'string') {
                return getImageUrl(order.photos);
            }
        }
        return getImageUrl(order.photo);
    };

    return (
        <div className="container my-5">
            <div className="row align-items-center">
                <div className="col-lg-6">
                    <h1 className="display-4 fw-bold mb-4">Помогаем питомцам вернуться домой</h1>
                    <p className="lead mb-4 text-muted">Сервис для поиска потерянных домашних животных</p>
                    
                    {/* Поиск с подсказками */}
                    <div className="search-container position-relative mb-4">
                        <div className="input-group input-group-lg shadow-sm">
                            <input 
                                type="text" 
                                className="form-control border-primary" 
                                id="quickSearch" 
                                placeholder="Начните вводить описание животного..." 
                                aria-label="Поиск животных"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                                style={{borderRight: 'none'}}
                            />
                            <button className="btn btn-primary" type="button" onClick={handleSearchSubmit}>
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                        
                        {/* Подсказки поиска */}
                        {showSuggestions && (
                            <div className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-lg" 
                                 style={{zIndex: 1050, top: '100%'}}>
                                {suggestions.length > 0 ? (
                                    suggestions.slice(0, 5).map((order) => (
                                        <div 
                                            key={order.id} 
                                            className="p-3 border-bottom hover-bg-light"
                                            onClick={() => handleSuggestionClick(order)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div className="flex-shrink-0 me-3">
                                                    <img 
                                                        src={getSuggestionImageUrl(order)} 
                                                        alt={order.kind || 'Животное'} 
                                                        className="rounded"
                                                        style={{width: 50, height: 50, objectFit: 'cover'}}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 fw-bold">{order.kind || 'Не указано'}</h6>
                                                    <p className="mb-0 text-muted small">
                                                        {order.description && order.description.length > 60
                                                            ? `${order.description.substring(0, 60)}...`
                                                            : order.description || 'Нет описания'}
                                                    </p>
                                                    <small className="text-primary">
                                                        <i className="bi bi-geo-alt me-1"></i>
                                                        {order.district || 'Район не указан'}
                                                    </small>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <i className="bi bi-chevron-right text-muted"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-muted">
                                        <i className="bi bi-search me-2"></i>
                                        Ничего не найдено
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Кнопки действий */}
                    <div className="d-flex flex-wrap gap-3 mt-4">
                        <a className="btn btn-light btn-lg px-4 shadow-sm" href="/add-pet.html">
                            <i className="bi bi-plus-circle me-2"></i>Добавить объявление
                        </a>
                        <a className="btn btn-primary btn-lg px-4 shadow-sm" href="/search.html">
                            <i className="bi bi-search me-2"></i>Найти животное
                        </a>
                    </div>
                </div>
                
                {/* Изображение - исправленная версия */}
                <div className="col-lg-6 text-center mt-4 mt-lg-0">
                    <div className="position-relative">
                        <img 
                            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                            className="img-fluid rounded shadow-lg" 
                            alt="Счастливые питомцы" 
                            style={{maxHeight: '400px', objectFit: 'cover', width: '100%'}}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1514888286974-6d03cde4ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                            }}
                        />
                        <div className="position-absolute bottom-0 start-0 end-0 p-3" 
                             style={{
                                 background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                 borderBottomLeftRadius: '0.5rem',
                                 borderBottomRightRadius: '0.5rem'
                             }}>
                            <h5 className="text-white mb-0">Мы помогли вернуться домой более 1000 питомцам</h5>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Inline стили */}
            <style jsx="true">{`
                .hover-bg-light:hover {
                    background-color: #f8f9fa;
                }
                
                .pet-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .pet-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}

export default Content1;