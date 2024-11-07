import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UsuariosInactivos = () => {
    const [estudiantesInactivos, setEstudiantesInactivos] = useState(0);
    const [profesoresInactivos, setProfesoresInactivos] = useState(0);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                // Solicitar estudiantes inactivos
                const responseEstudiantes = await fetch(`${API_URL}/estudiantes/inactivos`, {
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
                const responseProfesores = await fetch(`${API_URL}/profesores/inactivos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!responseProfesores.ok) {
                    throw new Error('Error en la autenticación o en la solicitud de profesores inactivos');
                }
                const dataProfesores = await responseProfesores.json();
                setProfesoresInactivos(dataProfesores.cantidad);
            } catch (error) {
                console.error('Error al obtener datos de usuarios inactivos:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Link to="/admin/usuarios-inactivos" className="admin-card-link">
            <div className="admin-card">
                <h3 className="admin-card-title">Usuarios Inactivos</h3>
                <p className="admin-card-text">Estudiantes Inactivos: {estudiantesInactivos}</p>
                <p className="admin-card-text">Profesores Inactivos: {profesoresInactivos}</p>
            </div>
        </Link>
    );
};

export default UsuariosInactivos;
