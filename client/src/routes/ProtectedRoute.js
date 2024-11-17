import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token) => {
    try {
        const { exp } = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime > exp;
    } catch (e) {
        return true;
    }
};

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (token === null) return false;

    return !isTokenExpired(token);
};

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;
