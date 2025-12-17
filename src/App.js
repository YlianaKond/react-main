import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";

// Импорт страниц
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AddPetPage from "./pages/AddPetPage";
import SearchPage from "./pages/SearchPage";
import PetDetailsPage from "./pages/PetDetailsPage";
// Удалить: import LookingForHomePage from "./pages/LookingForHomePage";

function App() {
  return (
    <Router>
      <div className="app d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<HomePage />} />
            
            {/* Основные маршруты */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            {/* Удалить: <Route path="/looking-for-home" element={<LookingForHomePage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-pet" element={<AddPetPage />} />
            <Route path="/pet-details" element={<PetDetailsPage />} />
            <Route path="/pet/:id" element={<PetDetailsPage />} />
            
            {/* Редиректы для .html расширений */}
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/home.html" element={<Navigate to="/" replace />} />
            <Route path="/login.html" element={<Navigate to="/login" replace />} />
            <Route path="/register.html" element={<Navigate to="/register" replace />} />
            <Route path="/search.html" element={<Navigate to="/search" replace />} />
            {/* Удалить: <Route path="/looking-for-home.html" element={<Navigate to="/looking-for-home" replace />} /> */}
            <Route path="/profile.html" element={<Navigate to="/profile" replace />} />
            <Route path="/profil.html" element={<Navigate to="/profile" replace />} />
            <Route path="/add-pet.html" element={<Navigate to="/add-pet" replace />} />
            <Route path="/pet-details.html" element={<Navigate to="/pet-details" replace />} />
            
            {/* Резервный маршрут */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;