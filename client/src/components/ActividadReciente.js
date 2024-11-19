import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import API_URL from '../Server';

const ActividadReciente = () => {
    const [actividadReciente, setActividadReciente] = useState({ proyectos: [], cursos: [] });

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/actividad/reciente`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                setActividadReciente(data);
            } catch (error) {
                console.error('Error al obtener la actividad reciente:', error);
            }
        };

        fetchData();
    }, []);

    const actividadData = {
        labels: actividadReciente.proyectos.map(proyecto => proyecto.semana),
        datasets: [
            {
                label: 'Proyectos Creados',
                data: actividadReciente.proyectos.map(proyecto => proyecto.cantidad),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                fill: false,
            },
            {
                label: 'Cursos Creados',
                data: actividadReciente.cursos.map(curso => curso.cantidad),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                fill: false,
            }
        ]
    };

    return (
        <div className="admin-grafica-card">
            <Line
                data={actividadData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Actividad Reciente de Proyectos y Cursos',
                        },
                    },
                }}
            />
        </div>
    );
};

export default ActividadReciente;
