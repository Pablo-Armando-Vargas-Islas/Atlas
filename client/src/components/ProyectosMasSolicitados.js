import React, { useEffect, useState } from 'react';

const ProyectosMasSolicitados = () => {
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/proyectos/mas-solicitados`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setProyectos(data);
            } catch (error) {
                console.error('Error al obtener los proyectos más solicitados:', error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Proyectos Más Solicitados</h3>
            <ul>
                {proyectos.map(proyecto => (
                    <li key={proyecto.id} className="admin-card-list-item">
                        {proyecto.titulo}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProyectosMasSolicitados;
