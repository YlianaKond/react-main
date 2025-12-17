import React from "react";
import "../components/css/style.css";
import NewsletterSubscription from "./NewsletterSubscription"; // Импортируем компонент

function Footer() {
    return ( 
        <footer className="bg-dark text-white py-5">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <h5><i className="bi bi-heart-fill me-2"></i>Любимые питомцы</h5>
                        <p>Сервис для поиска потерянных домашних животных.</p>
                        
                       
                    </div>
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h5>Навигация</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="/" className="text-white-50 text-decoration-none">Главная</a></li>
                            <li className="mb-2"><a href="/search.html" className="text-white-50 text-decoration-none">Поиск животных</a></li>
                            <li className="mb-2"><a href="/looking-for-home.html" className="text-white-50 text-decoration-none">Ищут хозяев</a></li>
                            <li className="mb-2"><a href="/add-pet.html" className="text-white-50 text-decoration-none">Добавить объявление</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-4">
                        <h5>Контакты</h5>
                        <p><i className="bi bi-telephone me-2"></i>+7 (911) 123-45-67</p>
                        <p><i className="bi bi-envelope me-2"></i>info@getpetback.ru</p>
                        
                        <div className="mt-4">
                            <h6>Мы в соцсетях</h6>
                            <div className="d-flex gap-3 mt-2">
                                <a href="#" className="text-white-50"><i className="bi bi-facebook" style={{fontSize: '1.5rem'}}></i></a>
                                <a href="#" className="text-white-50"><i className="bi bi-telegram" style={{fontSize: '1.5rem'}}></i></a>
                                <a href="#" className="text-white-50"><i className="bi bi-instagram" style={{fontSize: '1.5rem'}}></i></a>
                                <a href="#" className="text-white-50"><i className="bi bi-vk" style={{fontSize: '1.5rem'}}></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="row align-items-center mt-4 pt-4 border-top border-secondary">
                    <div className="col-md-6">
                        <p className="mb-0">&copy; 2025 Любимые питомцы</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <a href="#" className="text-white-50 me-3">Политика конфиденциальности</a>
                        <a href="#" className="text-white-50">Условия использования</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;