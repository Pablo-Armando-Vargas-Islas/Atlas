import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import '../styles/MisSolicitudes.css';
import BotonDescarga from '../utils/BotonDescarga';

const MisSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [error, setError] = useState(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    const handleVerDetalles = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setShowModal(true);
    };

    const handleCerrarModal = () => {
        setShowModal(false);
        setSolicitudSeleccionada(null);
    };

    return (
        <div className="mis-solicitudes-container">
            <div className="solicitudes-content">
                <h1 className="text-center mb-4">Mis Solicitudes</h1>
                {error ? (
                    <p className="text-danger text-center">Error: {error}</p>
                ) : solicitudes.length === 0 ? (
                    <p className="text-center">No tienes solicitudes pendientes.</p>
                ) : (
                    <Table responsive bordered hover className="mis-solicitudes-table mt-4">
                        <thead className="table-header">
                            <tr>
                                <th className="text-center">Proyecto</th>
                                <th className="text-center">Fecha</th>
                                <th className="text-center">Estatus</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map((solicitud) => (
                                <tr key={solicitud.id}>
                                    <td className="text-center">{solicitud.titulo}</td>
                                    <td className="text-center">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                                    <td className="text-center">
                                        {solicitud.status_solicitud.charAt(0).toUpperCase() + solicitud.status_solicitud.slice(1)}
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-primary"
                                            className="ver-detalles-btn" // Usar la clase ya definida para el botón
                                            onClick={() => handleVerDetalles(solicitud)}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {/* Modal para Detalles de la Solicitud */}
                <Modal show={showModal} onHide={handleCerrarModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalles de la Solicitud</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'aceptada' && (
                            <>
                                <p>Tu solicitud ha sido aceptada.</p>
                                <p>IMPORTANTE: Recuerda que tienes solo 10 días para descargar el archivo de lo contrario perderás el acceso y deberás hacer otra solicitud.</p>
                            </>
                        )}
                        {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'rechazada' && (
                            <>
                                <p>Tu solicitud ha sido rechazada.</p>
                                <p>Motivo del rechazo: {solicitudSeleccionada.comentarios}</p>
                            </>
                        )}
                        {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'pendiente' && (
                            <>
                                <p>Tu solicitud aún está siendo revisada.</p>
                                <p>Por favor espera, se te notificará por correo electrónico cuando ya tengamos una respuesta para ti.</p>
                            </>
                        )}
                        {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'cerrado' && (
                            <>
                                <p>Tu solicitud ya finalizó.</p>
                                <p>Esta solicitud ya alcanzó el máximo de días disponible.</p>
                            </>
                        )}
                        {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'expirado' && (
                            <>
                                <p>Tu solicitud ha expirado.</p>
                                <p>Esta solicitud ya alcanzó el máximo de días disponible para su descarga desde que fué aceptada.</p>
                            </>
                        )}
                    </Modal.Body>
                    {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'aceptada' && (
                        <Modal.Footer>
                            {solicitudSeleccionada && solicitudSeleccionada.status_solicitud === 'aceptada' && (() => {
                                const fechaLimiteDescarga = new Date(solicitudSeleccionada.fecha_limite_descarga);
                                const hoy = new Date();

                                if (fechaLimiteDescarga >= hoy) {
                                    return <BotonDescarga id={solicitudSeleccionada.id} />;
                                } else {
                                    return <p>El periodo de descarga ha expirado.</p>;
                                }
                            })()}
                        </Modal.Footer>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default MisSolicitudes;
