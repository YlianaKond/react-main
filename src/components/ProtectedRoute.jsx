import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Проверка авторизации...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Сохраняем URL для возврата после входа
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login.html?return=${returnUrl}`} replace />;
  }

  return children;
}

export default ProtectedRoute;