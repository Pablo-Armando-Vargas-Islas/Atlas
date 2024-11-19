import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SolicitudesPendientes.css'; 
import API_URL from '../Server';

const SolicitudesPendientes = () => {
    const [solicitudes, setSolicitudes] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/solicitudes/pendientes`, {
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

    let cardStyle = "admin-card";
    if (solicitudes >= 5 && solicitudes <= 10) {
        cardStyle += " admin-card-warning"; 
    } else if (solicitudes > 10) {
        cardStyle += " admin-card-danger";
    }

    return (
        <>
            {solicitudes > 0 ? (
                <Link to="/admin/solicitudes" className="admin-card-link">
                    <div className={cardStyle}>
                        <h3 className="admin-card-title">Solicitudes Pendientes</h3>
                        <p className="admin-card-text">{solicitudes}</p>
                    </div>
                </Link>
            ) : (
                <div className={cardStyle}>
                    <h3 className="admin-card-title">Solicitudes Pendientes</h3>
                    <p className="admin-card-text">{solicitudes}</p>
                </div>
            )}
        </>
    );
};

export default SolicitudesPendientes;
