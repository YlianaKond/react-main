import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './components/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Создаем корневой элемент
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}

// Добавляем глобальные стили для анимаций
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  /* Анимации */
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Кастомные стили */
  .pet-card {
    transition: all 0.3s ease;
  }
  
  .pet-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  
  /* Стили для уведомлений */
  .toast-container {
    z-index: 9999;
  }
  
  /* Стили для загрузки */
  .spinner-wrapper {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
document.head.appendChild(globalStyles);