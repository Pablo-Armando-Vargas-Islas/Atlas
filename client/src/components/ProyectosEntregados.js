import React, { useEffect, useState } from 'react';

const ProyectosEntregados = () => {
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/proyectos/total`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                setProyectos(data);
            } catch (error) {
                console.error('Error al obtener proyectos:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Proyectos Entregados</h3>
            <ul>
                {proyectos.map(proyecto => (
                    <li key={proyecto.tipo_proyecto} className="admin-card-list-item">
                        {proyecto.tipo_proyecto}: {proyecto.cantidad}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProyectosEntregados;
