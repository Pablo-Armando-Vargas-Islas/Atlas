import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../Server';

const UsuariosInactivos = () => {
    const [estudiantesInactivos, setEstudiantesInactivos] = useState(0);
    const [profesoresInactivos, setProfesoresInactivos] = useState(0);
    const [administradoresInactivos, setAdministradoresInactivos] = useState(0);
    const [mostrarRevisar, setMostrarRevisar] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                // Solicitar estudiantes inactivos
                const responseEstudiantes = await fetch(`${API_URL}/api/metricas/estudiantes/inactivos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseEstudiantes.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de estudiantes inactivos');
                }
                const dataEstudiantes = await responseEstudiantes.json();
                setEstudiantesInactivos(dataEstudiantes.cantidad);

                // Solicitar profesores inactivos
                const responseProfesores = await fetch(`${API_URL}/api/metricas/profesores/inactivos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseProfesores.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de profesores inactivos');
                }
                const dataProfesores = await responseProfesores.json();
                setProfesoresInactivos(dataProfesores.cantidad);

                // Solicitar administradores inactivos
                const responseAdministradores = await fetch(`${API_URL}/api/metricas/administradores/inactivos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseAdministradores.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de administradores inactivos');
                }
                const dataAdministradores = await responseAdministradores.json();
                setAdministradoresInactivos(dataAdministradores.cantidad);

                // Consultar usuarios con inactividad prolongada
                const responseUsuariosInactivos = await fetch(`${API_URL}/api/metricas/usuarios-inactivos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseUsuariosInactivos.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de usuarios inactivos');
                }
                const dataUsuariosInactivos = await responseUsuariosInactivos.json();

                // Si hay al menos un usuario con inactividad prolongada, mostrar "REVISAR"
                if (dataUsuariosInactivos.length > 0) {
                    setMostrarRevisar(true);
                }
            } catch (error) {
                console.error('Error al obtener datos de usuarios inactivos:', error);
            }
        };

        fetchData();
    }, []);

    // Determinar el color de fondo en función del número de solicitudes
    let cardStyle = "admin-card";
    if (mostrarRevisar) {
        cardStyle += " admin-card-danger"; // Se agrega clase de advertencia (amarillo)
    }

    return (
        mostrarRevisar ? (
            <Link to="/admin/editar/usuarios-inactivos" className="admin-card-link">
                <div className={cardStyle}>
                    <h3 className="admin-card-title">Usuarios Inactivos</h3>
                    <p className="admin-card-text"></p>
                    <p className="admin-card-text">Revisar reporte mensual de usuarios inactivos</p>
                </div>
            </Link>
        ) : (
            <Link to="/admin/usuarios-inactivos" className="admin-card-link">
                <div className="admin-card">
                    <h3 className="admin-card-title">Usuarios Inactivos</h3>
                    <p className="admin-card-text">Administradores Inactivos: {administradoresInactivos}</p>
                    <p className="admin-card-text">Estudiantes Inactivos: {estudiantesInactivos}</p>
                    <p className="admin-card-text">Profesores Inactivos: {profesoresInactivos}</p>
                </div>
            </Link>
        )
    );
};

export default UsuariosInactivos;
