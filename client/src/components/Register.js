import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [nombre, setNombre] = useState("");
    const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [rol, setRol] = useState("alumno"); // valor por defecto es "alumno"
    const [alert, setAlert] = useState({ type: "", message: "" }); // Estado para la alerta
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password, name) => {
        return password.length >= 8 && !password.toLowerCase().includes(name.toLowerCase());
    };

    const validateNombre = (nombre) => {
        const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return re.test(String(nombre));
    };

    const getRolId = (rol) => {
        switch (rol) {
            case "docente":
                return 2; // Profesor
            case "alumno":
                return 3; // Alumno
            default:
                return 3; // Por defecto, asigna como alumno
        }
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" }); // Resetear alertas previas

        // Validaciones
        if (!validateNombre(nombre)) {
            setAlert({ type: "warning", message: "El nombre solo puede contener letras y espacios." });
            return;
        }

        if (!validateEmail(correoInstitucional)) {
            setAlert({ type: "warning", message: "Por favor ingrese un correo electrónico válido." });
            return;
        }

        if (!validatePassword(contraseña, nombre)) {
            setAlert({ type: "warning", message: "La contraseña debe tener al menos 8 caracteres y no debe contener su nombre." });
            return;
        }

        try {
            const rol_id = getRolId(rol); // Convertimos el rol a su correspondiente rol_id
            const body = { nombre, correo_institucional: correoInstitucional, contraseña, rol_id };
            
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.status === 200) {
                setAlert({ type: "success", message: "Registro exitoso" });
                setTimeout(() => {
                    navigate("/login"); // Redirigir al login después de un registro exitoso
                }, 2000);
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
        <div className="container">
            <h1 className="text-center mt-5">Registrar Usuario</h1>
            {alert.message && (
                <div className={`alert alert-${alert.type}`} role="alert">
                    {alert.message}
                </div>
            )}
            <form onSubmit={onSubmitForm}>
                <div className="form-group">
                    <label>Nombre completo</label>
                    <input
                        type="text"
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
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
                <div className="form-group">
                    <label>¿Eres alumno o docente?</label>
                    <select
                        className="form-control"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        required
                    >
                        <option value="alumno">Alumno</option>
                        <option value="docente">Docente</option>
                    </select>
                </div>
                <button className="btn btn-primary mt-3">Registrar</button>
            </form>
            <button
                className="btn btn-secondary mt-3"
                onClick={() => navigate("/login")}
            >
                Volver al Login
            </button>
        </div>
    );
};

export default Register;
