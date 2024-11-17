import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const UsuariosActivos = () => {
    const [estudiantesActivos, setEstudiantesActivos] = useState(0);
    const [profesoresActivos, setProfesoresActivos] = useState(0);
    const [administradoresActivos, setAdministradoresActivos] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                // Solicitar estudiantes activos
                const responseEstudiantes = await fetch(`${API_URL}/api/metricas/estudiantes/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseEstudiantes.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de estudiantes activos');
                }
                const dataEstudiantes = await responseEstudiantes.json();
                setEstudiantesActivos(dataEstudiantes.cantidad);

                // Solicitar profesores activos
                const responseProfesores = await fetch(`${API_URL}/api/metricas/profesores/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseProfesores.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de profesores activos');
                }
                const dataProfesores = await responseProfesores.json();
                setProfesoresActivos(dataProfesores.cantidad);

                // Solicitar Administradores activos
                const responseAdministradores = await fetch(`${API_URL}/api/metricas/administradores/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseAdministradores.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de Administradores activos');
                }
                const dataAdministradores = await responseAdministradores.json();
                setAdministradoresActivos(dataAdministradores.cantidad);
            } catch (error) {
                console.error('Error al obtener datos de usuarios activos:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Link to="/admin/actividad-usuarios" className="admin-card-link">
            <div className="admin-card">
                <h3 className="admin-card-title">Actividad Usuarios</h3>
                <p className="admin-card-text">Administradores Activos: {administradoresActivos}</p>
                <p className="admin-card-text">Estudiantes Activos: {estudiantesActivos}</p>
                <p className="admin-card-text">Profesores Activos: {profesoresActivos}</p>
            </div>
        </Link>
    );
};

export default UsuariosActivos;
