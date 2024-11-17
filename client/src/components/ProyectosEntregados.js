import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000';

const ProyectosEntregados = () => {
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/proyectos/total`, {
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

    const formatTipoProyecto = (tipo) => {
        return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    };

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Proyectos Entregados</h3>
            <ul>
                {proyectos.map(proyecto => (
                    <li key={proyecto.tipo_proyecto} className="admin-card-list-item">
                        {formatTipoProyecto(proyecto.tipo_proyecto)}: {proyecto.cantidad}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProyectosEntregados;
