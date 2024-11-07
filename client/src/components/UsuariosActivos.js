import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UsuariosActivos = () => {
    const [estudiantesActivos, setEstudiantesActivos] = useState(0);
    const [profesoresActivos, setProfesoresActivos] = useState(0);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                // Solicitar estudiantes activos
                const responseEstudiantes = await fetch(`${API_URL}/estudiantes/activos`, {
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
                const responseProfesores = await fetch(`${API_URL}/profesores/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseProfesores.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de profesores activos');
                }
                const dataProfesores = await responseProfesores.json();
                setProfesoresActivos(dataProfesores.cantidad);
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
                <p className="admin-card-text">Estudiantes Activos: {estudiantesActivos}</p>
                <p className="admin-card-text">Profesores Activos: {profesoresActivos}</p>
            </div>
        </Link>
    );
};

export default UsuariosActivos;
