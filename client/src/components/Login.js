import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './styles/Login.css';

const Login = () => {
    const [usuario, setUsuario] = useState("");
    //const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();


    const onSubmitForm = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" }); // Resetear alertas previas

        try {
            const body = { usuario, contraseña };
            const response = await login(body);

            if (response.ok) {
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
        <div className="backgroud-container-login">
        <div className="container login-container d-flex align-items-center justify-content-center min-vh-100">
            <div className="login-box col-md-6 shadow p-5 rounded-4 bg-white">
                <h1 className="text-center mb-4">Atlas</h1>
                {alert.message && (
                    <div className={`alert alert-${alert.type}`} role="alert">
                        {alert.message}
                    </div>
                )}
                <form onSubmit={onSubmitForm}>
                    <div className="form-group login-form-group mb-3">
                        {/* <label htmlFor="email">Correo electrónico</label> 
                        <input
                            type="email"
                            className="form-control login-form-control rounded-pill"
                            id="email"
                            placeholder="Correo electrónico"
                            value={correoInstitucional}
                            onChange={(e) => setCorreoInstitucional(e.target.value)}
                            required
                        />*/}
                        <input
                            type="text"
                            className="form-control login-form-control rounded-pill"
                            id="usuario"
                            placeholder="Usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group login-form-group mb-3 position-relative">
                        {/* <label htmlFor="password">Contraseña</label> */}
                        <input
                            type="password"
                            className="form-control login-form-control rounded-pill"
                            id="password"
                            placeholder="Contraseña"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary login-btn-primary w-100 mt-3 rounded-pill">
                        Iniciar Sesión
                    </button>
                    <div className="forgot-password-link-container">
    <button
        type="button"
        className="btn btn-link forgot-password-link"
        onClick={() => navigate("/forgot-password")}
    >
        ¿Has olvidado la contraseña?
    </button>
</div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default Login;
