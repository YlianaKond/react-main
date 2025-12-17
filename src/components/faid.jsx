import "../components/css/style.css";
import img9 from "../components/image/foto9.jfif";
function faind() {
    return ( <div>
        <div className="col-md-6 col-lg-4">
  <div className="card pet-card h-100 position-relative">
    <span className="badge urgent status-badge">СРОЧНО!</span>
    <img src={img9} className="card-img-top" alt="Мурзик" style={{height: 250, objectFit: 'cover'}} />
    <div className="card-body">
      <h5 className="card-title">Мурзик</h5>
      <p className="card-text">Дружелюбный рыжий кот, ищет заботливую семью. Очень ласковый, приучен к лотку.</p>
      <div className="pet-features mb-3">
        <div className="d-flex align-items-center mb-2">
          <span className="feature-icon">
            <i className="bi bi-gender-male" />
          </span>
          <span>Мальчик, 2 года</span>
        </div>
        <div className="d-flex align-items-center mb-2">
          <span className="feature-icon">
            <i className="bi bi-geo-alt" />
          </span>
          <span>Центральный район</span>
        </div>
        <div className="d-flex align-items-center">
          <span className="feature-icon">
            <i className="bi bi-calendar" />
          </span>
          <span>В приюте 2 месяца</span>
        </div>
      </div>
    </div>
  </div>
</div>

    </div> );
}

export default faind;