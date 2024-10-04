import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card } from 'react-bootstrap'; // Importamos los componentes necesarios
import { FaList, FaThLarge } from 'react-icons/fa'; // Iconos para cambiar de vista

const MisSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // Estado para manejar el modo de vista
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
                {/* Botones para cambiar el modo de vista */}
                <div className="view-toggle mb-4">
                    <Button
                        variant={viewMode === "list" ? "primary" : "outline-primary"}
                        onClick={() => setViewMode('list')}
                        className="me-2"
                    >
                        <FaList /> Vista de Lista
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "primary" : "outline-primary"}
                        onClick={() => setViewMode('grid')}
                    >
                        <FaThLarge /> Vista de Cuadrícula
                    </Button>
                </div>

                {error ? (
                    <p>Error: {error}</p>
                ) : solicitudes.length === 0 ? (
                    <p>No tienes solicitudes pendientes.</p>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <ListView solicitudes={solicitudes} />
                        ) : (
                            <GridView solicitudes={solicitudes} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Componente para vista en lista
const ListView = ({ solicitudes }) => {
    return (
        <div className="list-view">
            {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="list-item mb-3 p-3">
                    <p><strong>Proyecto solicitado:</strong> {solicitud.titulo || 'Sin título'}</p>
                    <p><strong>Motivo:</strong> {solicitud.motivo || 'Sin motivo'}</p>
                    <p><strong>Estatus:</strong> {solicitud.status_solicitud || 'Pendiente'}</p>
                    {solicitud.status_solicitud === 'aceptada' && solicitud.ruta_archivo_comprimido ? (
                        <p><a href={solicitud.ruta_archivo_comprimido}>Acceder al proyecto</a></p>
                    ) : (
                        <p>{solicitud.status_solicitud === 'rechazada' ? 'Solicitud rechazada' : 'En espera de aprobación'}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

// Componente para vista en cuadrícula
const GridView = ({ solicitudes }) => {
    return (
        <Row className="grid-view">
            {solicitudes.map((solicitud) => (
                <Col key={solicitud.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>{solicitud.titulo || 'Sin título'}</Card.Title>
                            <Card.Text><strong>Motivo:</strong> {solicitud.motivo || 'Sin motivo'}</Card.Text>
                            <Card.Text><strong>Status:</strong> {solicitud.status_solicitud || 'Pendiente'}</Card.Text>
                            {solicitud.status_solicitud === 'aceptada' && solicitud.ruta_archivo_comprimido ? (
                                <Card.Text><a href={solicitud.ruta_archivo_comprimido}>Acceder al proyecto</a></Card.Text>
                            ) : (
                                <Card.Text>{solicitud.status_solicitud === 'rechazada' ? 'Solicitud rechazada' : 'En espera de aprobación'}</Card.Text>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default MisSolicitudes;
