import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SolicitudesPendientes = () => {
    const [solicitudes, setSolicitudes] = useState(0);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/solicitudes/pendientes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                setSolicitudes(data.cantidad);
            } catch (error) {
                console.error('Error al obtener solicitudes pendientes:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Link to="/admin/solicitudes" className="admin-card-link">
            <div className="admin-card">
                <h3 className="admin-card-title">Solicitudes Pendientes</h3>
                <p className="admin-card-text">{solicitudes}</p>
            </div>
        </Link>
    );
};

export default SolicitudesPendientes;
