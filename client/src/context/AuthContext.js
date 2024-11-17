import React, { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5000'; 
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [rol, setRol] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const inactivityTimer = useRef(null);
    

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const { exp, rol_id, id } = jwtDecode(storedToken);
                const currentTime = Math.floor(Date.now() / 1000);
                if (currentTime > exp) {
                    logout();
                } else {
                    setToken(storedToken);
                    setRol(rol_id);
                    setUserId(id);
                }
            } catch (e) {
                logout();
            }
        }
    }, []);

    // Función para manejar el login
    const login = async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
    
            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                setRol(data.usuario.rol_id);
                setUserId(parseInt(data.usuario.id)); 
                localStorage.setItem("token", data.token);

                // Redirecciones según el rol del usuario
                if (data.usuario.rol_id === 1) {
                    navigate("/admin/dashboard");
                } else if (data.usuario.rol_id === 2) {
                    navigate("/Buscador");
                } else if (data.usuario.rol_id === 3) {
                    navigate("/Buscador");
                }
    
                return { ok: true, token: data.token };
            } else {
                const errorData = await response.json();
                return { ok: false, error: errorData.error || "Error de autenticación" };
            }
        } catch (err) {
            console.error(err.message);
            return { ok: false, error: "Error de conexión" };
        }
    };
    
    const logout = () => {
        setToken(null);
        setRol(null);
        setUserId(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Tiempo de inactividad en milisegundos (10 minutos)
    const INACTIVITY_LIMIT = 10 * 60 * 1000; 

    // Función para restablecer el temporizador de inactividad
    const resetInactivityTimer = () => {
        if (token) { 
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }
            inactivityTimer.current = setTimeout(() => {
                logout();
                alert("Tu sesión ha expirado por inactividad.");
            }, INACTIVITY_LIMIT);
        }
    };

    // useEffect para iniciar la vigilancia de inactividad
    useEffect(() => {
        window.addEventListener("mousemove", resetInactivityTimer);
        window.addEventListener("keypress", resetInactivityTimer);

        resetInactivityTimer();

        return () => {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }
            window.removeEventListener("mousemove", resetInactivityTimer);
            window.removeEventListener("keypress", resetInactivityTimer);
        };
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, rol, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
