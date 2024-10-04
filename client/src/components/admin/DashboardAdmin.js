import React, { useState, useEffect } from 'react';

const DashboardAdmin = () => {
    const [solicitudes, setSolicitudes] = useState([]);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/solicitudes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setSolicitudes(data); // Aquí se recibe la lista de solicitudes
            } catch (error) {
                console.error('Error al obtener las solicitudes:', error);
            }
        };

        fetchSolicitudes();
    }, []);

    const aceptarSolicitud = async (solicitudId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes/solicitud/aceptar/${solicitudId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Solicitud aceptada con éxito');
                setSolicitudes((prevSolicitudes) =>
                    prevSolicitudes.filter((solicitud) => solicitud.id !== solicitudId)
                );
            } else {
                alert('Error al aceptar la solicitud');
            }
        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
        }
    };

    const rechazarSolicitud = async (solicitudId) => {
        const comentarios = prompt('Proporcione el motivo del rechazo:');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes/solicitud/rechazar/${solicitudId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comentarios }),
            });

            if (response.ok) {
                alert('Solicitud rechazada con éxito');
                setSolicitudes((prevSolicitudes) =>
                    prevSolicitudes.filter((solicitud) => solicitud.id !== solicitudId)
                );
            } else {
                alert('Error al rechazar la solicitud');
            }
        } catch (error) {
            console.error('Error al rechazar la solicitud:', error);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="main-content">
                <h1>Solicitudes de Acceso a Proyectos</h1>
                {solicitudes.length === 0 ? (
                    <p>No hay solicitudes pendientes.</p>
                ) : (
                    <ul>
                        {solicitudes
                            .filter(solicitud => solicitud.status_solicitud === 'pendiente') // Filtrar solo las pendientes
                            .map((solicitud) => (
                                <li key={solicitud.id}>
                                    <p><strong>Proyecto:</strong> {solicitud.titulo}</p>
                                    <p><strong>Solicitante:</strong> {solicitud.nombre}</p>
                                    <p><strong>Motivo:</strong> {solicitud.motivo}</p>
                                    <p><strong>Status:</strong> {solicitud.status_solicitud}</p>
                                    <button onClick={() => aceptarSolicitud(solicitud.id)}>Aceptar</button>
                                    <button onClick={() => rechazarSolicitud(solicitud.id)}>Rechazar</button>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DashboardAdmin;
