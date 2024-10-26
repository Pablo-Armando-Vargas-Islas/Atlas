import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Register.css';

const Register = () => {
    const [nombre, setNombre] = useState("");
    const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [confirmarContraseña, setConfirmarContraseña] = useState("");
    const [codigoEstudiante, setCodigoEstudiante] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const navigate = useNavigate();

    // Funciones de validación
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password, name) => {
        if (password.length < 8) {
            return false;
        }

        const nameParts = name.toLowerCase().split(/\s+/);
        for (const part of nameParts) {
            if (part.length > 2 && password.toLowerCase().includes(part)) {
                return false;
            }
        }

        return true;
    };

    const validateNombre = (nombre) => {
        const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return re.test(String(nombre));
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" });

        // Eliminar espacios al inicio y al final de los valores
        const nombreTrimmed = nombre.trim();
        const correoTrimmed = correoInstitucional.trim();
        const codigoTrimmed = codigoEstudiante.trim();
        const contraseñaTrimmed = contraseña.trim();
        const confirmarContraseñaTrimmed = confirmarContraseña.trim();

        // Validaciones
        if (!validateNombre(nombreTrimmed)) {
            setAlert({ type: "warning", message: "El nombre no puede contener caracteres especiales." });
            return;
        }

        if (!validateEmail(correoTrimmed)) {
            setAlert({ type: "warning", message: "Por favor ingrese un correo electrónico válido." });
            return;
        }

        if (!validatePassword(contraseñaTrimmed, nombreTrimmed)) {
            setAlert({ type: "warning", message: "La contraseña debe tener al menos 8 caracteres y no debe contener su nombre." });
            return;
        }

        if (contraseñaTrimmed !== confirmarContraseñaTrimmed) {
            setAlert({ type: "warning", message: "Las contraseñas no coinciden." });
            return;
        }

        try {
            const body = {
                nombre: nombreTrimmed,
                correo_institucional: correoTrimmed,
                contraseña: contraseñaTrimmed,
                rol_id: 3, // Siempre será Alumno
                codigo_estudiante: codigoTrimmed,
            };

            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.status === 200) {
                setAlert({ type: "success", message: "Registro exitoso" });
                setTimeout(() => {
                    navigate("/login");
                }, 500);
            } else {
                const data = await response.json();
                setAlert({ type: "danger", message: data });
            }
        } catch (err) {
            console.error(err.message);
            setAlert({ type: "danger", message: "Error de conexión" });
        }
    };

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center">
            <div className="col-md-6 col-lg-5 p-4 shadow register-box">
                <h1 className="register-title text-center mb-4">Bienvenido</h1>
                {alert.message && (
                    <div className={`alert alert-${alert.type}`} role="alert">
                        {alert.message}
                    </div>
                )}
                <form onSubmit={onSubmitForm}>
                    <div className="form-group mb-3">
                        <input
                            type="text"
                            className="form-control register-form-control"
                            id="nombre"
                            placeholder="Nombre completo"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value.trimStart())}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="text"
                            className="form-control register-form-control"
                            placeholder="Código de Estudiante"
                            value={codigoEstudiante}
                            onChange={(e) => setCodigoEstudiante(e.target.value.trimStart())}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="email"
                            className="form-control register-form-control"
                            id="email"
                            placeholder="Correo electrónico"
                            value={correoInstitucional}
                            onChange={(e) => setCorreoInstitucional(e.target.value.trimStart())}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control register-form-control"
                            id="password"
                            placeholder="Contraseña"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value.trimStart())}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control register-form-control"
                            id="confirmPassword"
                            placeholder="Confirmar Contraseña"
                            value={confirmarContraseña}
                            onChange={(e) => setConfirmarContraseña(e.target.value.trimStart())}
                            required
                        />
                    </div>
                    <button type="submit" className="btn register-btn-primary w-100 mt-3">
                        Registrarme
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
