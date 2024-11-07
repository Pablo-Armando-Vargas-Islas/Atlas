import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Spinner } from 'react-bootstrap'; 
import '../styles/ChangePassword.css';

const ChangePassword = () => {
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false); // Estado para el spinner
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (nuevaContrasena !== confirmarContrasena) {
            setAlert({ type: "danger", message: "Las contraseñas no coinciden" });
            return;
        }

        setLoading(true); // Activa el estado de carga

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ nueva_contraseña: nuevaContrasena }),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({ type: "success", message: "Contraseña actualizada exitosamente" });
                const decoded = jwtDecode(token);

                switch (decoded.rol_id) {
                    case 1:
                        navigate("/admin/dashboard");
                        break;
                    case 2:
                    case 3:
                        navigate("/Buscador");
                        break;
                    default:
                        setAlert({ type: "danger", message: "Rol de usuario no reconocido" });
                }
            } else {
                setAlert({ type: "danger", message: data.error });
            }
        } catch (error) {
            console.error("Error al cambiar la contraseña:", error);
            setAlert({ type: "danger", message: "Error de conexión" });
        } finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };

    return (
        <div className="backgroud-container-login">
            <div className="container change-password-container d-flex align-items-center justify-content-center min-vh-100">
                <div className="change-password-box col-md-6 shadow p-5 rounded-4 bg-white" style={{ marginTop: "-120px" }}>
                    <h1 className="text-center mb-4">Cambio de Contraseña</h1>
                    {alert.message && (
                        <div className={`alert alert-${alert.type}`} role="alert">
                            {alert.message}
                        </div>
                    )}
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                className="form-control rounded-pill"
                                placeholder="Nueva contraseña"
                                value={nuevaContrasena}
                                onChange={(e) => setNuevaContrasena(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                className="form-control rounded-pill"
                                placeholder="Confirmar nueva contraseña"
                                value={confirmarContrasena}
                                onChange={(e) => setConfirmarContrasena(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`btn btn-primary-cambio w-100 mt-3 rounded-pill ${loading ? "loading-button" : ""}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        style={{ marginRight: '8px', color: '#ffffff' }} // Color del spinner en blanco
                                    />
                                    <span style={{ color: '#ffffff' }}>Cambiando...</span> {/* Texto en blanco */}
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
