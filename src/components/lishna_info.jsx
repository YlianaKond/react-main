function Lisha_info() {
    return ( <div>
        <div className="col-lg-9">
  <div className="tab-content">
    <div className="tab-pane fade show active" id="profile">
      <div className="card">
        <div className="card-header bg-white">
          <h4 className="card-title mb-0">
            <i className="bi bi-person me-2" />Личная информация
          </h4>
        </div>
        <div className="card-body">
          <form action="profile.html" method="POST">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName" className="form-label">Имя *</label>
                <input type="text" className="form-control" id="firstName" name="firstName" defaultValue="Анна" required />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">Фамилия *</label>
                <input type="text" className="form-control" id="lastName" name="lastName" defaultValue="Петрова" required />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="city" className="form-label">Город</label>
              <input type="text" className="form-control" id="city" name="city" defaultValue="Санкт-Петербург" />
            </div>
            <div className="mb-3">
              <label htmlFor="about" className="form-label">О себе</label>
              <textarea className="form-control" id="about" name="about" rows={4} defaultValue={"Люблю животных и помогаю найти им дом. Имею двух кошек и собаку."} />
            </div>
            <button type="submit" className="btn btn-primary">Сохранить изменения</button>
          </form>
        </div>
      </div>
    </div>
  </div></div>

    </div> );
}

export default Lisha_info;