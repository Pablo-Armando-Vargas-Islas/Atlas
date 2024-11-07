import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/RegisterAdmin.css';
import { FaArrowLeft } from 'react-icons/fa';

const RegisterAdmin = () => {
    const [nombre, setNombre] = useState("");
    const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [cedula, setCedula] = useState("");
    const [rol, setRol] = useState(""); 
    const [alert, setAlert] = useState({ type: "", message: "" });
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
    };

    const validateNombre = (nombre) => {
        const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return re.test(String(nombre));
    };

    const getRolId = (rol) => {
        switch (rol) {
            case "admin":
                return 1; // Admin
            case "docente":
                return 2; // Profesor
            case "alumno":
                return 3; // Alumno
            default:
                return null;
        }
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setAlert({ type: "", message: "" });

        // Validaciones
        if (!validateNombre(nombre)) {
            setAlert({ type: "warning", message: "El nombre no puede contener caracteres especiales." });
            return;
        }

        if (!validateEmail(correoInstitucional)) {
            setAlert({ type: "warning", message: "Por favor ingrese un correo electrónico válido." });
            return;
        }

        if (!cedula) {
            setAlert({ type: "warning", message: "Por favor ingrese la cédula o el código de estudiante." });
            return;
        }

        try {
            const rol_id = getRolId(rol);
            if (!rol_id) {
                setAlert({ type: "warning", message: "Seleccione un rol válido." });
                return;
            }

            const body = {
                nombre,
                correo_institucional: correoInstitucional,
                rol_id,
                cedula
            };

            const response = await fetch("http://localhost:5000/api/auth/registerAdmin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.status === 200) {
                setAlert({ type: "success", message: "Registro exitoso. Se ha enviado un correo con la contraseña temporal." });
                setTimeout(() => {
                    navigate("/admin/usuarios");
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
        <div className="backgroud-container-register">
            <div className="container register-container d-flex align-items-center justify-content-center min-vh-100">
                <div className="register-box col-md-6 shadow p-5 rounded-4 bg-white">
                    <div className="navegar-atras-registerAdmin" onClick={handleGoBack}>
                        <FaArrowLeft className="icono-navegar-atras" /> Volver
                    </div>
                    <h1 className="text-center mb-4">Registro de Usuario</h1>
                    {alert.message && (
                        <div className={`alert alert-${alert.type}`} role="alert">
                            {alert.message}
                        </div>
                    )}
                    <form onSubmit={onSubmitForm}>
                        <div className="form-group register-form-group mb-3">
                            <select
                                className="form-control register-select-control rounded-pill"
                                id="rol"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                required
                            >
                                <option value="" disabled>Seleccione el rol</option>
                                <option value="alumno">Alumno</option>
                                <option value="docente">Docente</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className="form-group register-form-group mb-3">
                            <input
                                type="text"
                                className="form-control register-form-control rounded-pill"
                                id="nombre"
                                placeholder="Nombre completo"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group register-form-group mb-3">
                            <input
                                type="text"
                                className="form-control register-form-control rounded-pill"
                                id="cedula"
                                placeholder="Cédula o Código de Estudiante"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group register-form-group mb-3">
                            <input
                                type="email"
                                className="form-control register-form-control rounded-pill"
                                id="email"
                                placeholder="Correo electrónico"
                                value={correoInstitucional}
                                onChange={(e) => setCorreoInstitucional(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary register-btn-primary w-100 mt-4 rounded-pill">
                            Registrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterAdmin;
