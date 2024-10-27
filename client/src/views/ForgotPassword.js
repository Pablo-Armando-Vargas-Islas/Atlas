import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [correo, setCorreo] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const navigate = useNavigate();

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" }); // Resetear alertas previas

        try {
            const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ correo_institucional: correo }),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({ type: "success", message: data.message });
                setTimeout(() => navigate("/login"), 2000); // Redirige al login después de 5 segundos
            } else {
                setAlert({ type: "danger", message: data.error });
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
                    <h1 className="text-center mb-4">Recuperar Contraseña</h1>
                    {alert.message && (
                        <div className={`alert alert-${alert.type}`} role="alert">
                            {alert.message}
                        </div>
                    )}
                    <form onSubmit={onSubmitForm}>
                        <div className="form-group login-form-group mb-3">
                            <input
                                type="email"
                                className="form-control login-form-control rounded-pill"
                                id="email"
                                placeholder="Correo electrónico"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary login-btn-primary w-100 mt-3 rounded-pill">
                            Enviar Código
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;