import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/css/style.css';

function SearchPage() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState({
        kind: '',
        district: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const itemsPerPage = 10;

    const API_BASE_URL = 'https://pets.сделай.site/api';
    const BASE_IMAGE_URL = 'https://pets.сделай.site';

    // Создаем свой ApiService прямо в компоненте
    const ApiService = {
        searchOrders: async (params = {}) => {
            try {
                const queryParams = new URLSearchParams();
                if (params.kind) queryParams.append('kind', params.kind);
                if (params.district) queryParams.append('district', params.district);
                if (params.status) queryParams.append('status', params.status);

                // Ключевое изменение: не добавляем параметры пагинации!
                // Это позволит получить ВСЕ записи
                const url = `${API_BASE_URL}/search/order${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                console.log('Запрос к API:', url);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                console.log('Ответ API:', data);

                // Обрабатываем разные форматы ответа
                let orders = [];
                let total = 0;

                if (data.data && data.data.orders && Array.isArray(data.data.orders)) {
                    orders = data.data.orders;
                    total = data.data.total || data.data.count || orders.length;
                } else if (data.data && data.data.pets && Array.isArray(data.data.pets)) {
                    orders = data.data.pets;
                    total = data.data.total || data.data.count || orders.length;
                } else if (Array.isArray(data)) {
                    orders = data;
                    total = data.length;
                } else if (data.data && Array.isArray(data.data)) {
                    orders = data.data;
                    total = data.total || data.count || orders.length;
                }

                return {
                    data: {
                        orders: orders,
                        total: total,
                        count: orders.length
                    }
                };
            } catch (error) {
                console.error('Ошибка ApiService:', error);
                throw error;
            }
        }
    };

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

    // Загружаем все объявления
    const loadAllOrders = async (page = 1) => {
        setLoading(true);
        try {
            const response = await ApiService.searchOrders({});

            if (response && response.data && response.data.orders) {
                const allResults = response.data.orders;
                const total = response.data.total || allResults.length;

                // Применяем пагинацию на клиенте
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedResults = allResults.slice(startIndex, endIndex);

                console.log(`Загружено: ${allResults.length} животных, показываем ${paginatedResults.length} из них`);

                setPets(paginatedResults);
                setTotalItems(total);
                setTotalPages(Math.ceil(total / itemsPerPage));
            } else {
                setPets([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Ошибка при загрузке объявлений:', error);
            setPets([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Выполняем поиск
    const performSearch = async (page = 1, params = searchFilters) => {
        setLoading(true);
        setCurrentPage(page);

        try {
            if (!params.kind && !params.district && !params.status) {
                await loadAllOrders(page);
                return;
            }

            const response = await ApiService.searchOrders({
                kind: params.kind,
                district: params.district,
                status: params.status
            });

            if (response && response.data && response.data.orders) {
                const allResults = response.data.orders;
                const total = response.data.total || allResults.length;

                // Применяем пагинацию на клиенте
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedResults = allResults.slice(startIndex, endIndex);

                setPets(paginatedResults);
                setTotalItems(total);
                setTotalPages(Math.ceil(total / itemsPerPage));
            } else {
                setPets([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Ошибка при поиске:', error);
            setPets([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllOrders(1);
    }, []);

    useEffect(() => {
        if (searchFilters.kind.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const response = await ApiService.searchOrders({ kind: searchFilters.kind });

                    if (response && response.data && response.data.orders) {
                        const suggestions = response.data.orders.slice(0, 10);

                        // Уникальные названия без повторов
                        const uniqueKinds = new Set();
                        const formattedSuggestions = [];

                        for (const pet of suggestions) {
                            const kind = pet.kind?.trim() || '';
                            if (kind && !uniqueKinds.has(kind.toLowerCase())) {
                                uniqueKinds.add(kind.toLowerCase());
                                formattedSuggestions.push({
                                    id: pet.id,
                                    kind: kind,
                                    district: pet.district || '',
                                    photo: pet.photos[0] || null
                                });
                            }

                            if (formattedSuggestions.length >= 5) {
                                break;
                            }
                        }

                        setSearchSuggestions(formattedSuggestions);
                    } else {
                        setSearchSuggestions([]);
                    }
                } catch (error) {
                    console.error('Ошибка при поиске подсказок:', error);
                    setSearchSuggestions([]);
                }
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setSearchSuggestions([]);
        }
    }, [searchFilters.kind]);

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'kind') {
            setCurrentPage(1);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        performSearch(1, searchFilters);
    };

    const handleResetFilters = () => {
        setSearchFilters({
            kind: '',
            district: '',
            status: ''
        });
        setCurrentPage(1);
        setSearchSuggestions([]);
        loadAllOrders(1);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchFilters(prev => ({
            ...prev,
            kind: suggestion.kind
        }));
        setSearchSuggestions([]);
        setCurrentPage(1);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return '';
        }

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        console.log(`${BASE_IMAGE_URL}${imagePath} [eq  ]`);
        return `${BASE_IMAGE_URL}${imagePath}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'found':
                return <span className="badge bg-success">Найден</span>;
            case 'looking_for_home':
                return <span className="badge bg-warning text-dark">Ищет дом</span>;
            case 'lost':
                return <span className="badge bg-danger">Потерян</span>;
            default:
                return <span className="badge bg-secondary">Неизвестно</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return dateString;
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);

            if (searchFilters.kind || searchFilters.district || searchFilters.status) {
                performSearch(page, searchFilters);
            } else {
                loadAllOrders(page);
            }

            window.scrollTo(0, 0);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let startPage = Math.max(2, currentPage - 2);
            let endPage = Math.min(totalPages - 1, currentPage + 2);

            if (currentPage <= 3) {
                startPage = 2;
                endPage = 5;
            }

            if (currentPage >= totalPages - 2) {
                startPage = totalPages - 4;
                endPage = totalPages - 1;
            }

            if (startPage > 2) {
                pages.push('ellipsis-start');
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages - 1) {
                pages.push('ellipsis-end');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    if (loading && pets.length === 0) {
        return (
            <div className="search-page">
                <section className="hero-section py-5 bg-light">
                    <div className="container">
                        <h1 className="display-5 fw-bold mb-3">Поиск животных</h1>
                        <p className="lead mb-4">Найдите потерянных питомцев или тех, кто ищет новый дом</p>
                    </div>
                </section>

                <section className="search-section py-5">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                            <p className="mt-3">Загрузка животных из API...</p>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="search-page">
            <section className="hero-section py-5 bg-light">
                <div className="container">
                    <h1 className="display-5 fw-bold mb-3">Поиск животных</h1>
                    <p className="lead mb-4">
                        {totalItems > 0 ? (
                            <>В базе данных <span className="text-primary fw-bold">{totalItems}</span> животных</>
                        ) : (
                            <>В базе данных нет животных</>
                        )}
                    </p>

                    <div className="card shadow-sm mb-5">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    {totalItems > 0 ? (
                                        <div className="alert alert-success mb-0 py-2">
                                            <i className="bi bi-check-circle me-2"></i>
                                            Данные загружены из API: {totalItems} животных
                                            {totalPages > 1 && `, ${totalPages} страниц`}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning mb-0 py-2">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            В базе данных нет животных. API не вернул данных.
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => loadAllOrders(1)}
                                    disabled={loading}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Обновить
                                </button>
                            </div>

                            <form onSubmit={handleSearchSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label htmlFor="kind" className="form-label">Вид животного</label>
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="kind"
                                                name="kind"
                                                value={searchFilters.kind}
                                                onChange={handleSearchChange}
                                                placeholder="Кот, собака и т.д."
                                                disabled={totalItems === 0}
                                            />
                                            {searchSuggestions.length > 0 && (
                                                <div className="suggestions-dropdown position-absolute w-100 bg-white border rounded mt-1 shadow-sm"
                                                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                                    {searchSuggestions.map(suggestion => (
                                                        <div key={suggestion.id}
                                                            className="suggestion-item p-2 border-bottom cursor-pointer"
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            style={{ cursor: 'pointer' }}>
                                                            <div className="d-flex align-items-center">
                                                                {suggestion.photo && (
                                                                    <img
                                                                        src={getImageUrl(suggestion.photo)}
                                                                        alt={suggestion.kind}
                                                                        className="me-2"
                                                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="fw-bold">{suggestion.kind}</div>
                                                                    {suggestion.district && (
                                                                        <small className="text-muted">{suggestion.district}</small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label htmlFor="district" className="form-label">Район</label>
                                        <select
                                            className="form-select"
                                            id="district"
                                            name="district"
                                            value={searchFilters.district}
                                            onChange={handleSearchChange}
                                            disabled={totalItems === 0}
                                        >
                                            <option value="">Все районы</option>
                                            {districts.map((district, index) => (
                                                <option key={index} value={district}>
                                                    {district}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label htmlFor="status" className="form-label">Статус</label>
                                        <select
                                            className="form-select"
                                            id="status"
                                            name="status"
                                            value={searchFilters.status}
                                            onChange={handleSearchChange}
                                            disabled={totalItems === 0}
                                        >
                                            <option value="">Все статусы</option>
                                            <option value="found">Найден</option>
                                            <option value="looking_for_home">Ищет дом</option>
                                            <option value="lost">Потерян</option>
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={totalItems === 0 || loading}
                                            >
                                                <i className="bi bi-search me-2"></i>Найти
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={handleResetFilters}
                                                disabled={totalItems === 0}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>Сбросить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pets-section py-5">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">
                            {totalItems > 0 ? (
                                <>Показано животных: <span className="text-primary">{pets.length}</span> из <span className="text-primary">{totalItems}</span></>
                            ) : (
                                <>Нет доступных животных</>
                            )}
                            {totalPages > 1 && (
                                <span className="ms-3">
                                    (страница {currentPage} из {totalPages})
                                </span>
                            )}
                        </h2>
                        {totalItems > 0 && totalPages > 1 && (
                            <div className="text-muted">
                                <div className="btn-group btn-group-sm" role="group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-info"
                                        onClick={() => {
                                            if (currentPage < totalPages) {
                                                handlePageChange(currentPage + 1);
                                            }
                                        }}
                                        disabled={currentPage >= totalPages}
                                    >
                                        <i className="bi bi-arrow-right"></i> Следующая
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {totalItems === 0 ? (
                        <div className="text-center py-5">
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                В базе данных нет животных. API не вернул данных.
                            </div>
                        </div>
                    ) : pets.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {pets.map((pet) => (
                                    <div key={pet.id} className="col">
                                        <div className="card h-100 shadow-sm pet-card">
                                            <div className="position-relative">
                                                <img
                                                    src={getImageUrl(pet.photos)}
                                                    className="card-img-top"
                                                    alt={pet.kind || 'Животное'}
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '';
                                                    }}
                                                />
                                                <div className="position-absolute top-0 end-0 m-2">
                                                    {getStatusBadge(pet.status)}
                                                </div>
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title">{pet.kind || 'Не указано'}</h5>
                                                <p className="card-text flex-grow-1">
                                                    {pet.description && pet.description.length > 100
                                                        ? `${pet.description.substring(0, 100)}...`
                                                        : pet.description || 'Нет описания'}
                                                </p>
                                                <div className="mt-auto">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <small className="text-muted">
                                                            <i className="bi bi-geo-alt me-1"></i>
                                                            {pet.district || 'Район не указан'}
                                                        </small>
                                                        <small className="text-muted">
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {formatDate(pet.date)}
                                                        </small>
                                                    </div>
                                                    <Link
                                                        to={`/pet/${pet.id}`}
                                                        className="btn btn-primary w-100"
                                                    >
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        Подробнее
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <nav className="mt-5" aria-label="Пагинация">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="text-muted small">
                                            Показывается {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} из {totalItems} животных
                                        </div>
                                    </div>

                                    <ul className="pagination justify-content-center flex-wrap">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                aria-label="Первая страница"
                                            >
                                                <i className="bi bi-chevron-double-left"></i>
                                            </button>
                                        </li>

                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                aria-label="Предыдущая страница"
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>

                                        {renderPageNumbers().map((page, index) => {
                                            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                                                return (
                                                    <li key={`ellipsis-${index}`} className="page-item disabled">
                                                        <span className="page-link">...</span>
                                                    </li>
                                                );
                                            }

                                            return (
                                                <li
                                                    key={page}
                                                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(page)}
                                                        aria-current={currentPage === page ? 'page' : undefined}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        })}

                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                aria-label="Следующая страница"
                                            >
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </li>

                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                aria-label="Последняя страница"
                                            >
                                                <i className="bi bi-chevron-double-right"></i>
                                            </button>
                                        </li>
                                    </ul>

                                    <div className="row justify-content-center mt-4">
                                        <div className="col-md-6">
                                           
                                                
                                                
                                                
                                                
                                            </div>
                                        </div>
                                    
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </section>

            
        </div>
    );
}

export default SearchPage;