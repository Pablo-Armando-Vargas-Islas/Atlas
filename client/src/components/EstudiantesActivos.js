import React, { useEffect, useState } from 'react';

const EstudiantesActivos = () => {
    const [estudiantesActivos, setEstudiantesActivos] = useState(0);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/estudiantes/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                setEstudiantesActivos(data.cantidad);
            } catch (error) {
                console.error('Error al obtener estudiantes activos:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Estudiantes Activos</h3>
            <p className="admin-card-text">{estudiantesActivos}</p>
        </div>
    );
};

export default EstudiantesActivos;
