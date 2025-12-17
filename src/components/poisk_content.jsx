import "../components/css/style.css";
function Poisk_content() {
    return ( <div>
       <div className="container">
  <div className="row align-items-center">
    <div className="col-lg-8">
      <h1 className="display-5 fw-bold mb-3">Питомцы, которые ищут дом</h1>
      <p className="lead mb-4">Здесь собраны животные, которые ждут своих новых хозяев. Каждому из них нужна ваша забота и любовь.</p>
    </div>
    <div className="col-lg-4 text-center">
      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 120, height: 120}}>
        <i className="bi bi-house-heart text-white" style={{fontSize: '3rem'}} />
      </div>
      <h4>28 животных</h4>
      <p className="text-muted">ждут новый дом</p>
    </div>
  </div>
</div>

    </div> );
}

export default Poisk_content;