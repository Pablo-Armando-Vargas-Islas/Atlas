import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Utilidad para verificar si el token ha expirado
const isTokenExpired = (token) => {
    try {
        const { exp } = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime > exp;
    } catch (e) {
        return true; // Si falla la verificación, consideramos que está expirado
    }
};

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (token === null) return false;

    return !isTokenExpired(token);
};

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        // Si no está autenticado, redirige a la página de login
        return <Navigate to="/login" />;
    }

    // Si está autenticado, renderiza el componente hijo
    return children;
};

export default ProtectedRoute;
