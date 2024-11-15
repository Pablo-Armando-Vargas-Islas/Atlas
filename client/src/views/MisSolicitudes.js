import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaList } from 'react-icons/fa';
import '../styles/MisSolicitudes.css';
import BotonDescarga from '../utils/BotonDescarga';

const MisSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [error, setError] = useState(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
    const currentSolicitudes = solicitudes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPagination = () => (
        <div className="paginacion">
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    className={`boton-pagina ${currentPage === index + 1 ? 'activo' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    ); 

    const handleToggleExpand = (id) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter((rowId) => rowId !== id));
        } else {
            setExpandedRows([...expandedRows, id]);
        }
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
                            {currentSolicitudes.map((solicitud) => (
                                <tr key={solicitud.id}>
                                    <td className="text-center">
                                        {expandedRows.includes(solicitud.id) ? (
                                            solicitud.titulo
                                        ) : (
                                            `${solicitud.titulo.slice(0, 50)} ...`
                                        )}
                                        {solicitud.titulo.length > 50 && (
                                        <div className="text-center">
                                            <Button
                                                variant="link"
                                                onClick={() => handleToggleExpand(solicitud.id)}
                                                className="p-0 d-block mx-auto"
                                            >
                                                {expandedRows.includes(solicitud.id) ? 'Ver menos' : 'Ver más'}
                                            </Button>
                                        </div>
                                    )}
                                    </td>
                                    <td className="text-center">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                                    <td className="text-center">
                                        {solicitud.status_solicitud.charAt(0).toUpperCase() + solicitud.status_solicitud.slice(1)}
                                    </td>
                                    <td className="text-center">
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Ver detalles</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 ver-proyectos-btn align-middle" 
                                                onClick={() => handleVerDetalles(solicitud)}
                                            >
                                                <FaList />
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                <div>
                {renderPagination()}
                </div>

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
