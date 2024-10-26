import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './styles/RegisterAdmin.css'; 

const RegisterAdmin = () => {
    const [nombre, setNombre] = useState("");
    const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [codigoEstudiante, setCodigoEstudiante] = useState("");
    const [cedula, setCedula] = useState("");
    const [rol, setRol] = useState(""); 
    const [alert, setAlert] = useState({ type: "", message: "" }); 
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

        if (!validatePassword(contraseña, nombre)) {
            setAlert({ type: "warning", message: "La contraseña debe tener al menos 8 caracteres y no debe contener su nombre." });
            return;
        }

        try {
            const rol_id = getRolId(rol); 
            const body = {
                nombre,
                correo_institucional: correoInstitucional,
                contraseña,
                rol_id,
                codigo_estudiante: rol === "alumno" ? codigoEstudiante : null,
                cedula: rol === "docente" ? cedula : null,
            };
            
            
            const response = await fetch("http://localhost:5000/api/auth/registerAdmin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.status === 200) {
                setAlert({ type: "success", message: "Registro exitoso" });
                setTimeout(() => {
                    navigate("/login"); 
                }, 500); //Segundos de espera para redirigir al login
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
                <h1 className="text-center mb-4">Registro</h1>
                {alert.message && (
                    <div className={`alert alert-${alert.type}`} role="alert">
                        {alert.message}
                    </div>
                )}
                <form onSubmit={onSubmitForm}>
                    <div className="form-group register-form-group mb-3">
                    <div className="form-group register-form-group mb-3">
                        {/* <label htmlFor="rol">¿Eres alumno o docente?</label> */}
                        <select
                            className="form-control register-select-control rounded-pill"
                            id="rol"
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            required
                        >
                            <option value="" disabled>¿Eres alumno o docente?</option>
                            <option value="alumno">Alumno</option>
                            <option value="docente">Docente</option>
                        </select>
                    </div>
                        {/*<label htmlFor="nombre">Nombre completo</label>*/}
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
                    
                    {rol === "alumno" && (
                        <div className="form-group register-form-group mb-3">
                            <input
                                type="text"
                                className="form-control register-form-control rounded-pill"
                                placeholder="Código de Estudiante"
                                value={codigoEstudiante}
                                onChange={(e) => setCodigoEstudiante(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {rol === "docente" && (
                        <div className="form-group register-form-group mb-3">
                            <input
                                type="text"
                                className="form-control register-form-control rounded-pill"
                                placeholder="Cédula"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group register-form-group mb-3">
                        {/* <label htmlFor="email">Email</label> */}
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
                    <div className="form-group register-form-group mb-3">
                        {/* <label htmlFor="password">Contraseña</label> */}
                        <input
                            type="password"
                            className="form-control register-form-control rounded-pill"
                            id="password"
                            placeholder="Contraseña"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
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