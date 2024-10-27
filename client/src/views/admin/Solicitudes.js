import React, { useState, useEffect } from 'react';
import '../../styles/GestionCursosProfesor.css';
import { Modal, Button, Form } from 'react-bootstrap';

const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRechazoModal, setShowRechazoModal] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');

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
                setSolicitudes(data);
            } catch (error) {
                console.error('Error al obtener las solicitudes:', error);
            }
        };

        fetchSolicitudes();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setSolicitudSeleccionada(null);
    };

    const handleRechazoClose = () => {
        setShowRechazoModal(false);
        setMotivoRechazo('');
    };

    const handleShow = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setShowModal(true);
    };

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
                handleClose();
            } else {
                alert('Error al aceptar la solicitud');
            }
        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
        }
    };

    const rechazarSolicitud = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes/solicitud/rechazar/${solicitudSeleccionada.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comentarios: motivoRechazo }),
            });

            if (response.ok) {
                alert('Solicitud rechazada con éxito');
                setSolicitudes((prevSolicitudes) =>
                    prevSolicitudes.filter((solicitud) => solicitud.id !== solicitudSeleccionada.id)
                );
                handleRechazoClose();
                handleClose();
            } else {
                alert('Error al rechazar la solicitud');
            }
        } catch (error) {
            console.error('Error al rechazar la solicitud:', error);
        }
    };

    const handleRechazoModal = () => {
        setShowRechazoModal(true);
        setShowModal(false);
    };

    return (
        <div className="gestion-cursos-profesor-container">
            <div className="gestion-cursos-main-content">
                <h2 className='text-center'>Solicitudes de Acceso a Proyectos</h2>
                {solicitudes.length === 0 ? (
                    <p>No hay solicitudes pendientes.</p>
                ) : (
                    <table className="gestion-cursos-table">
                        <thead>
                            <tr>
                                <th>Proyecto</th>
                                <th>Solicitante</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes
                                .filter(solicitud => solicitud.status_solicitud === 'pendiente') // Filtrar solo las pendientes
                                .map((solicitud) => (
                                    <tr key={solicitud.id}>
                                        <td>{solicitud.titulo}</td>
                                        <td>{solicitud.nombre}</td>
                                        <td>{solicitud.rol}</td>
                                        <td>
                                            <button
                                                className="ver-solicitud-btn"
                                                onClick={() => handleShow(solicitud)}
                                            >
                                                Ver solicitud
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal para ver la solicitud */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Solicitud</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {solicitudSeleccionada && (
                        <>
                            <p><strong>Proyecto:</strong> {solicitudSeleccionada.titulo}</p>
                            <p><strong>Solicitante:</strong> {solicitudSeleccionada.nombre}, {solicitudSeleccionada.rol}</p>
                            <p><strong>Motivo:</strong> {solicitudSeleccionada.motivo}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className='aceptar-solicitud-btn'
                        onClick={() => aceptarSolicitud(solicitudSeleccionada.id)}
                    >
                        Aceptar
                    </Button>
                    <Button
                        className='rechazar-solicitud-btn'
                        onClick={handleRechazoModal}
                    >
                        Rechazar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal para ingresar el motivo del rechazo */}
            <Modal show={showRechazoModal} onHide={handleRechazoClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Motivo del Rechazo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="motivoRechazo">
                        <Form.Label>Motivo del rechazo</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Escribe el motivo por el cual estás rechazando la solicitud..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleRechazoClose}>Cancelar</Button>
                    <Button
                        className='rechazar-solicitud-btn'
                        onClick={rechazarSolicitud}
                        disabled={!motivoRechazo.trim()} // Deshabilitar si no hay motivo
                    >
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Solicitudes;
