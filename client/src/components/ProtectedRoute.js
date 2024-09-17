// components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/" />;
  }

  // Si hay token, renderizar el componente protegido
  return children;
};

export default ProtectedRoute;