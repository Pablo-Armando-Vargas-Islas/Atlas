import React, { useEffect, useState } from 'react';
import API_URL from '../Server';

const AlertasYNotificaciones = () => {
    const [alertas, setAlertas] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/alertas`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setAlertas(data);
            } catch (error) {
                console.error('Error al obtener alertas:', error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="admin-card alertas-card">
            <h3 className="admin-card-title">Alertas y Notificaciones</h3>
            <ul>
                {alertas.map((alerta, index) => (
                    <li key={index} className="admin-alert-list-item">
                        <strong>{alerta.tipo_alerta}:</strong> {alerta.cantidad}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlertasYNotificaciones;
