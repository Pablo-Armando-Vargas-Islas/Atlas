import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const ProyectosMasSolicitados = () => {
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/proyectos/mas-solicitados`, {
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
        <Link to="/admin/proyectos-mas-solicitados" className="admin-card-link">
            <div className="admin-card">
                <h3 className="admin-card-title">Proyectos más solicitados</h3>
                <ul>
                    {proyectos.map(proyecto => (
                        <li key={proyecto.id} className="admin-card-list-item">
                            {proyecto.titulo.length > 30
                                ? `${proyecto.titulo.substring(0, 30)}...`
                                : proyecto.titulo}
                        </li>
                    ))}
                </ul>
            </div>
        </Link>
    );
};

export default ProyectosMasSolicitados;
