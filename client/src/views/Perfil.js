import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Perfil.css";
import { Spinner } from "react-bootstrap";
import API_URL from '../Server';

const Perfil = () => {
    const [nombre, setNombre] = useState("");
    const [correoInstitucional, setCorreoInstitucional] = useState("");
    const [usuario, setUsuario] = useState("");
    const [rol, setRol] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState({});
    const [isModified, setIsModified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/profile`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await response.json();
                if (response.status === 200) {
                    setNombre(data.nombre);
                    setCorreoInstitucional(data.correo_institucional);
                    setUsuario(data.rol_id === 3 ? data.codigo_estudiante : data.cedula);
                    setRol(data.rol_id);
                    setInitialData({
                        nombre: data.nombre,
                        correoInstitucional: data.correo_institucional,
                        usuario: data.rol_id === 3 ? data.codigo_estudiante : data.cedula,
                    });
                } else {
                    setAlert({ type: "danger", message: data.message });
                }
            } catch (err) {
                console.error(err.message);
                setAlert({ type: "danger", message: "Error al obtener los datos del perfil" });
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (
            nombre !== initialData.nombre ||
            correoInstitucional !== initialData.correoInstitucional ||
            usuario !== initialData.usuario
        ) {
            setIsModified(true);
        } else {
            setIsModified(false);
        }
    }, [nombre, correoInstitucional, usuario, initialData]);

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ type: "", message: "" });

        try {
            const body = { nombre, correo_institucional: correoInstitucional, usuario };
            const response = await fetch(`${API_URL}/api/auth/profile/update`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (response.status === 200) {
                setAlert({ type: "success", message: data.message });
                setInitialData({ nombre, correoInstitucional, usuario });
                setIsModified(false);
                setTimeout(() => {
                    navigate("/Buscador");
                }, 2000);
            } else {
                setAlert({ type: "danger", message: data.message });
            }
        } catch (err) {
            console.error(err.message);
            setAlert({ type: "danger", message: "Error al actualizar el perfil" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-box col-md-6 shadow p-5 rounded-4 bg-white">
                <h1 className="text-center mb-4">Mis Datos</h1>
                {alert.message && (
                    <div className={`alert alert-${alert.type}`} role="alert">
                        {alert.message}
                    </div>
                )}
                <form onSubmit={onSubmitForm}>
                    <div className="form-group mb-3">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre completo"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Usuario</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={rol === 3 ? "Código de Estudiante" : "Cédula"}
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Correo</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Correo electrónico"
                            value={correoInstitucional}
                            onChange={(e) => setCorreoInstitucional(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`btn profile-btn-primary w-100 mt-4 ${loading ? "loading-button" : ""}`}
                        disabled={!isModified || loading} 
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "Guardar"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Perfil;
