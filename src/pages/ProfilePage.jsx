import React from 'react';
import RealUserInfo from '../components/real_user_info';
import '../components/css/style.css';

function ProfilePage() {
  return (
    <div className="profile-page">
      <section className="profile-header py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="display-5 fw-bold mb-3">Личный кабинет</h1>
              <p className="lead mb-0">Управляйте вашими данными и объявлениями</p>
            </div>
            <div className="col-md-4 text-end">
              <a href="/add-pet.html" className="btn btn-light btn-lg">
                <i className="bi bi-plus-circle me-2"></i>
                Добавить объявление
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <section className="profile-content py-5">
        <div className="container">
          <RealUserInfo />
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;