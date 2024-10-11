import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const { login, token, rol } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && rol) {
            // Redirigir según el rol del usuario
            if (rol === 1) {
                navigate("/admin/dashboard");
            } else if (rol === 2) {
                navigate("/profesor/dashboard");
            } else if (rol === 3) {
                navigate("/alumno/dashboard");
            }
        }
    }, [token, rol, navigate]);

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" }); // Resetear alertas previas

        try {
            const body = { correo_institucional: correoInstitucional, contraseña };
            const response = await login(body);

            if (response.ok) {
                // Guardar el token en localStorage
                localStorage.setItem("token", response.token);
                console.log("Token guardado en localStorage:", response.token);
            } else {
                setAlert({ type: "danger", message: response.error });
            }

        } catch (err) {
            console.error(err.message);
            setAlert({ type: "danger", message: "Error de conexión" });
        }
    };

    return (
        <div className="container">
            <h1 className="text-center mt-5">Login</h1>
            {alert.message && (
                <div className={`alert alert-${alert.type}`} role="alert">
                    {alert.message}
                </div>
            )}
            <form onSubmit={onSubmitForm}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={correoInstitucional}
                        onChange={(e) => setCorreoInstitucional(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        required
                    />
                </div>
                <button className="btn btn-primary mt-3">Login</button>
            </form>
            <button 
                className="btn btn-link mt-3" 
                onClick={() => navigate("/register")}>
                No tienes una cuenta? Regístrate aquí
            </button>
        </div>
    );
};

export default Login;
