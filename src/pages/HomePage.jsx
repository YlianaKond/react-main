import React, { useState, useEffect, useCallback } from "react";
import Slider from "../components/slider";
import Content from "../components/content";
import Content1 from "../components/content1";
import NewsletterSubscription from "../components/NewsletterSubscription";

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPets: 0,
    foundHomes: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setStats({
        totalPets: 1247,
        foundHomes: 893,
        activeUsers: 3421
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка главной страницы...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero секция с быстрым поиском */}
      <section className="hero-section py-5 bg-light">
        <div className="container">
          <Content1 />
        </div>
      </section>

   
      

      {/* Слайдер с успешными историями */}
      <section className="slider-section py-5">
        <div className="container">
          <Slider />
        </div>
      </section>

      {/* Последние найденные животные */}
      <section className="recent-pets-section py-5 bg-light">
        <div className="container">
          <Content />
        </div>
      </section>

      {/* Подписка на новости */}
      <section className="newsletter-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <NewsletterSubscription />
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}

export default HomePage;