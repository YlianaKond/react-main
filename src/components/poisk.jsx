import React, { useState, useEffect } from 'react';

const Poisk = () => {
    const [kind, setKind] = useState('');
    const [district, setDistrict] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastRefresh, setLastRefresh] = useState(Date.now());

   const API_BASE_URL = 'https://pets.сделай.site/api';

    // Загружаем все объявления
    const loadAllPets = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/pets`);
            
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }

            const data = await response.json();
            
            let allPets = [];
            
            if (data.data && data.data.orders) {
                allPets = data.data.orders;
            } 
            else if (data && Array.isArray(data)) {
                allPets = data;
            }
            else if (data && data.orders) {
                allPets = data.orders;
            }
            else if (data && data.data && Array.isArray(data.data)) {
                allPets = data.data;
            }
            else {
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        allPets = data[key];
                        break;
                    }
                }
            }

            setResults(allPets);
            
            if (allPets.length === 0) {
                setError('В базе нет объявлений');
            }

        } catch (error) {
            setError(`Ошибка загрузки: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Поиск по фильтрам
    const handleSearch = (e) => {
        e.preventDefault();
        
        if (!kind.trim() && !district.trim()) {
            setError('Введите что-нибудь для поиска');
            return;
        }

        setLoading(true);
        
        // Используем уже загруженные данные для поиска
        const searchResults = results.filter(pet => {
            const petKind = (pet.kind || '').toLowerCase();
            const petDistrict = (pet.district || '').toLowerCase();
            const searchKind = kind.toLowerCase().trim();
            const searchDistrict = district.toLowerCase().trim();
            
            let matchesKind = true;
            let matchesDistrict = true;
            
            if (searchKind) {
                matchesKind = petKind.includes(searchKind);
            }
            
            if (searchDistrict) {
                matchesDistrict = petDistrict.includes(searchDistrict);
            }
            
            return matchesKind && matchesDistrict;
        });
        
        setResults(searchResults);
        setLoading(false);
        
        if (searchResults.length === 0) {
            setError(`По запросу "${kind}"${district ? ` в районе "${district}"` : ''} ничего не найдено`);
        } else {
            setError('');
        }
    };

    // Загружаем при старте
    useEffect(() => {
        loadAllPets();
    }, [lastRefresh]);

    // Стили
    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
        },
        form: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #dee2e6'
        },
        inputGroup: {
            display: 'flex',
            gap: '15px',
            marginBottom: '15px'
        },
        input: {
            flex: 1,
            padding: '10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '16px'
        },
        select: {
            flex: 1,
            padding: '10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '16px',
            backgroundColor: 'white'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px'
        },
        searchBtn: {
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
        },
        refreshBtn: {
            backgroundColor: '#6c757d'
        },
        error: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #f5c6cb'
        },
        results: {
            marginTop: '20px'
        },
        petCard: {
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: 'white'
        },
        petKind: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '5px',
            color: '#333'
        },
        petInfo: {
            marginBottom: '3px',
            color: '#666',
            fontSize: '14px'
        }
    };

    return (
        <div style={styles.container}>
            {/* Форма поиска */}
            <div style={styles.form}>
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSearch}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            value={kind}
                            onChange={(e) => setKind(e.target.value)}
                            placeholder="Вид животного"
                            style={styles.input}
                            disabled={loading}
                        />
                        
                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            style={styles.select}
                            disabled={loading}
                        >
                            <option value="">Все районы</option>
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
                    </div>
                    
                    <div style={styles.buttonGroup}>
                        <button 
                            type="submit" 
                            style={styles.searchBtn}
                            disabled={loading}
                        >
                            {loading ? 'Поиск...' : 'Поиск'}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => {
                                setLastRefresh(Date.now());
                                setKind('');
                                setDistrict('');
                                setError('');
                            }}
                            style={{...styles.searchBtn, ...styles.refreshBtn}}
                            disabled={loading}
                        >
                            Сбросить
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Результаты */}
            <div style={styles.results}>
                {loading ? (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        Загрузка...
                    </div>
                ) : results.length > 0 ? (
                    <div>
                        {results.map((pet, index) => (
                            <div key={pet.id || index} style={styles.petCard}>
                                <div style={styles.petKind}>
                                    {pet.kind || 'Без названия'}
                                </div>
                                <div style={styles.petInfo}>
                                    <strong>Район:</strong> {pet.district || 'Не указан'}
                                </div>
                                <div style={styles.petInfo}>
                                    <strong>Описание:</strong> {pet.description || 'Нет описания'}
                                </div>
                                <div style={styles.petInfo}>
                                    <strong>Телефон:</strong> {pet.phone || 'Не указан'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                        Нет объявлений для показа
                    </div>
                )}
            </div>
        </div>
    );
};

export default Poisk;