import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [rol, setRol] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
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
                console.log("Datos del login:", data); // VerificaCión de que el ID está presente
    
                setToken(data.token);
                setRol(data.usuario.rol_id);
                setUserId(parseInt(data.usuario.id)); 
                localStorage.setItem("token", data.token);

                // Redirecciones según el rol del usuario
                if (data.usuario.rol_id === 1) {
                    navigate("/admin/dashboard");
                } else if (data.usuario.rol_id === 2) {
                    navigate("/profesor/dashboard");
                } else if (data.usuario.rol_id === 3) {
                    navigate("/home");
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
        navigate("/");
    };

    // Tiempo de inactividad en milisegundos (por ejemplo, 30 minutos)
    const INACTIVITY_LIMIT = 30 * 60 * 1000; 
    let inactivityTimer;

    // Función para restablecer el temporizador de inactividad
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            logout();
            alert("Tu sesión ha expirado por inactividad.");
        }, INACTIVITY_LIMIT);
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
            clearTimeout(inactivityTimer);
            window.removeEventListener("mousemove", resetInactivityTimer);
            window.removeEventListener("keypress", resetInactivityTimer);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ token, rol, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};