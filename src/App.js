import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AddPetPage from "./pages/AddPetPage";
import SearchPage from "./pages/SearchPage";
import PetDetailsPage from "./pages/PetDetailsPage";
import { isAuthenticated } from "./utils/auth";

function App() {
  return (
    <Router>
      <div className="app d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/pet/:id" element={<PetDetailsPage />} />
            
            {/* Защищенные маршруты */}
            <Route path="/profile" element={
              isAuthenticated() ? <ProfilePage /> : <Navigate to="/login" replace />
            } />
            <Route path="/add-pet" element={
              isAuthenticated() ? <AddPetPage /> : <Navigate to="/login" replace />
            } />
            
            {/* Редиректы */}
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/home.html" element={<Navigate to="/" replace />} />
            <Route path="/login.html" element={<Navigate to="/login" replace />} />
            <Route path="/register.html" element={<Navigate to="/register" replace />} />
            <Route path="/search.html" element={<Navigate to="/search" replace />} />
            <Route path="/profile.html" element={
              isAuthenticated() ? <ProfilePage /> : <Navigate to="/login" replace />
            } />
            <Route path="/profil.html" element={
              isAuthenticated() ? <ProfilePage /> : <Navigate to="/login" replace />
            } />
            <Route path="/add-pet.html" element={
              isAuthenticated() ? <AddPetPage /> : <Navigate to="/login" replace />
            } />
            <Route path="/pet-details.html" element={<PetDetailsPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;