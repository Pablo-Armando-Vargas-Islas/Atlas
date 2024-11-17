import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

const API_URL = 'http://localhost:5000';

const EstadoSolicitudes = () => {
    const [solicitudesPorEstado, setSolicitudesPorEstado] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/solicitudes/estado`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                setSolicitudesPorEstado(data);
            } catch (error) {
                console.error('Error al obtener el estado de las solicitudes:', error);
            }
        };

        fetchData();
    }, []);

    const solicitudesData = {
        labels: solicitudesPorEstado.map(solicitud => solicitud.status_solicitud),
        datasets: [
            {
                label: 'Número de Solicitudes por Estado',
                data: solicitudesPorEstado.map(solicitud => solicitud.cantidad),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    return (
        <div className="admin-grafica-card">
            <Bar
                data={solicitudesData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Distribución de Solicitudes por Estado',
                        },
                    },
                }}
            />
        </div>
    );
};

export default EstadoSolicitudes;
