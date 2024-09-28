import React, { useState, useEffect } from 'react';

const MisSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/solicitudes/misSolicitudes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error al obtener las solicitudes");
                }

                const data = await response.json();
                setSolicitudes(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchSolicitudes();
    }, []);

    return (
        <div className="mis-solicitudes-container">
            <div className="solicitudes-content">
                <h1>Mis Solicitudes</h1>
                {error ? (
                    <p>Error: {error}</p>
                ) : solicitudes.length === 0 ? (
                    <p>No tienes solicitudes pendientes.</p>
                ) : (
                    <ul>
                        {solicitudes.map((solicitud) => (
                            <li key={solicitud.id}>
                                <p><strong>Proyecto:</strong> {solicitud.titulo || 'Sin título'}</p>
                                <p><strong>Motivo:</strong> {solicitud.motivo || 'Sin motivo'}</p>
                                <p><strong>Status:</strong> {solicitud.status_solicitud || 'Pendiente'}</p>
                                {solicitud.status_solicitud === 'aceptada' && solicitud.ruta_archivo_comprimido ? (
                                    <p><a href={solicitud.ruta_archivo_comprimido}>Acceder al proyecto</a></p>
                                ) : (
                                    <p>{solicitud.status_solicitud === 'rechazada' ? 'Solicitud rechazada' : 'En espera de aprobación'}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MisSolicitudes;
