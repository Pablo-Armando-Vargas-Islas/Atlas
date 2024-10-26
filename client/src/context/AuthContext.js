import React, { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [rol, setRol] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const inactivityTimer = useRef(null); // Referencia para el temporizador de inactividad

    // Cargar el token y la información del usuario al montar el componente
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const { exp, rol_id, id } = jwtDecode(storedToken);
                const currentTime = Math.floor(Date.now() / 1000);
                if (currentTime > exp) {
                    logout(); // Si el token ha expirado, realiza el logout
                } else {
                    setToken(storedToken);
                    setRol(rol_id);
                    setUserId(id);
                }
            } catch (e) {
                logout(); // Si el token no es válido, realiza el logout
            }
        }
    }, []);

    // Función para manejar el login
    const login = async (credentials) => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
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
    
    // Función para manejar el logout
    const logout = () => {
        setToken(null);
        setRol(null);
        setUserId(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Tiempo de inactividad en milisegundos (por ejemplo, 30 minutos)
    const INACTIVITY_LIMIT = 5 * 60 * 1000; 

    // Función para restablecer el temporizador de inactividad
    const resetInactivityTimer = () => {
        if (token) { // Verificar si hay un token presente
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
        // Escuchar eventos de actividad del usuario
        window.addEventListener("mousemove", resetInactivityTimer);
        window.addEventListener("keypress", resetInactivityTimer);

        // Establecer el temporizador la primera vez
        resetInactivityTimer();

        // Limpiar los eventos al desmontar el componente
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
