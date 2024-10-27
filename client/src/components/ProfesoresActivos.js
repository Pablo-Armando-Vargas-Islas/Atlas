import React, { useEffect, useState } from 'react';

const ProfesoresActivos = () => {
    const [profesoresActivos, setProfesoresActivos] = useState(0);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/profesores/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setProfesoresActivos(data.cantidad);
            } catch (error) {
                console.error('Error al obtener profesores activos:', error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Profesores Activos</h3>
            <p className="admin-card-text">{profesoresActivos}</p>
        </div>
    );
};

export default ProfesoresActivos;
