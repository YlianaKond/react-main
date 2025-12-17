import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');
  const userEmail = localStorage.getItem('user_email');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="bi bi-heart-fill me-2 text-danger"></i>
          GET PET BACK
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Главная</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">Поиск животных</Link>
            </li>
           
            <li className="nav-item">
              <Link className="nav-link" to="/add-pet">
                {token ? 'Добавить объявление' : 'Добавить (требуется вход)'}
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            {token ? (
              <>
                <div className="d-none d-md-flex align-items-center me-3">
                  <i className="bi bi-person-circle me-2 text-light"></i>
                  <span className="text-light">{userEmail || 'Пользователь'}</span>
                </div>
                <Link className="btn btn-outline-light btn-sm me-2" to="/profile">
                  <i className="bi bi-person me-1"></i>Кабинет
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i>Выйти
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm me-2" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i>Войти
                </Link>
                <Link className="btn btn-primary btn-sm" to="/register">
                  <i className="bi bi-person-plus me-1"></i>Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;