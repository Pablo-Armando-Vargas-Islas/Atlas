import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, InputGroup, Nav, Modal } from "react-bootstrap";
import { FaList, FaThLarge } from "react-icons/fa";
import { jwtDecode as jwt_decode } from "jwt-decode";
import '../styles/DashboardProfesor.css';

const DashboardProfesor = () => {
    const [proyectos, setProyectos] = useState([]);
    const [atlasProyectos, setAtlasProyectos] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchAtlasTerm, setSearchAtlasTerm] = useState("");
    const [activeTab, setActiveTab] = useState("misProyectos");
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); // Proyecto seleccionado
    const [motivo, setMotivo] = useState(""); // Motivo de la solicitud

    // Obtener ID del usuario desde el token almacenado
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwt_decode(token);
            if (decodedToken && decodedToken.id) {
                setUserId(decodedToken.id); // Solo asigna el userId si el token está bien decodificado
            } else {
                console.error("Token inválido o sin id");
            }
        }
    }, []);

    // Fetch para obtener los proyectos del profesor
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;

        const fetchProyectosWithRetry = async () => {
            if (userId) {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/proyectos`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`Error ${response.status}: ${response.statusText}`);
                        }

                        const data = await response.json();
                        setProyectos(data);
                        console.log("Proyectos obtenidos en el frontend:", data);
                    } catch (err) {
                        console.error("Error al obtener los proyectos:", err);
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Reintentando obtener los proyectos... Intento ${retryCount}`);
                            setTimeout(fetchProyectosWithRetry, 2000); // Esperar 2 segundos antes de reintentar
                        } else {
                            console.error("Se alcanzó el número máximo de reintentos");
                        }
                    }
                }
            }
        };

        if (userId) {
            fetchProyectosWithRetry();
        }
    }, [userId, activeTab]);

    // Fetch para obtener todos los proyectos de Atlas
    useEffect(() => {
        const fetchAtlasProyectos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/proyectos/atlas`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setAtlasProyectos(data); // Guardar los proyectos en el estado
            } catch (err) {
                console.error("Error al obtener los proyectos de Atlas:", err);
            }
        };

        if (activeTab === "buscarAtlas") {
            fetchAtlasProyectos(); // Solo hacer la petición cuando esté en la pestaña Atlas
        }
    }, [activeTab]);

    // Función para abrir el modal con el proyecto seleccionado
    const verDetalles = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    // Función para manejar la solicitud de acceso
    const solicitarAcceso = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/solicitudes/crear', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proyecto_id: proyectoSeleccionado.id,
                    motivo: motivo,
                }),
            });

            if (response.ok) {
                alert('Solicitud enviada con éxito');
                setShowModal(false);
            } else {
                alert('Error al enviar la solicitud');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
        }
    };

    // Filtrar proyectos por búsqueda en "Mis Proyectos"
    const filteredProyectos = proyectos.filter((proyecto) =>
        proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrar proyectos por búsqueda en "Atlas"
    const filteredAtlasProyectos = atlasProyectos.filter((proyecto) =>
        proyecto.titulo.toLowerCase().includes(searchAtlasTerm.toLowerCase())
    );

    return (
        <div className="d-flex">
            {/* Main content */}
            <div className="main-content">
                {/* Navegación por pestañas (estilo carpetas) */}
                <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedTab) => setActiveTab(selectedTab)}>
                    <Nav.Item>
                        <Nav.Link eventKey="misProyectos">Mis Proyectos</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="buscarAtlas">Atlas</Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* Contenido según la pestaña activa */}
                <div className="tab-content mt-4">
                    {activeTab === "misProyectos" && (
                        <>
                            {/* Barra de búsqueda para "Mis Proyectos" */}
                            <div className="search-bar-container mb-4">
                                <InputGroup className="search-bar">
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar en mis proyectos"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                    <Button variant="primary" className="search-button">
                                        Buscar
                                    </Button>
                                </InputGroup>
                            </div>

                            {/* Contenedor de proyectos con selector de vista */}
                            <div className="projects-container">
                                <div className="projects-header d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0"></h5>
                                    <div className="view-toggle">
                                        <Button
                                            variant={viewMode === "list" ? "primary" : "outline-primary"}
                                            onClick={() => setViewMode("list")}
                                            className="me-2"
                                        >
                                            <FaList />
                                        </Button>
                                        <Button
                                            variant={viewMode === "grid" ? "primary" : "outline-primary"}
                                            onClick={() => setViewMode("grid")}
                                        >
                                            <FaThLarge />
                                        </Button>
                                    </div>
                                </div>

                                {/* Vista de lista o cuadrícula */}
                                <div className="projects-content">
                                    {viewMode === "list" ? (
                                        <ListView proyectos={filteredProyectos} onVerDetalles={verDetalles} />
                                    ) : (
                                        <GridView proyectos={filteredProyectos} onVerDetalles={verDetalles} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "buscarAtlas" && (
                        <>
                            {/* Barra de búsqueda para "Atlas" */}
                            <div className="search-bar-container mb-4">
                                <InputGroup className="search-bar">
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar en Atlas"
                                        value={searchAtlasTerm}
                                        onChange={(e) => setSearchAtlasTerm(e.target.value)}
                                        className="search-input"
                                    />
                                    <Button variant="primary" className="search-button">
                                        Buscar
                                    </Button>
                                </InputGroup>
                            </div>

                            {/* Contenedor de proyectos con selector de vista */}
                            <div className="projects-container">
                                <div className="projects-header d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0"></h5>
                                    <div className="view-toggle">
                                        <Button
                                            variant={viewMode === "list" ? "primary" : "outline-primary"}
                                            onClick={() => setViewMode("list")}
                                            className="me-2"
                                        >
                                            <FaList />
                                        </Button>
                                        <Button
                                            variant={viewMode === "grid" ? "primary" : "outline-primary"}
                                            onClick={() => setViewMode("grid")}
                                        >
                                            <FaThLarge />
                                        </Button>
                                    </div>
                                </div>

                                {/* Vista de lista o cuadrícula para proyectos de Atlas */}
                                <div className="projects-content">
                                    {viewMode === "list" ? (
                                        <ListView proyectos={filteredAtlasProyectos} onVerDetalles={verDetalles} />
                                    ) : (
                                        <GridView proyectos={filteredAtlasProyectos} onVerDetalles={verDetalles} />
                                    )}
                                </div>
                            </div>

                            {/* Modal de detalles del proyecto */}
                            <Modal show={showModal} onHide={cerrarModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Detalles del Proyecto</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {proyectoSeleccionado && (
                                        <>
                                            <p><strong>Título:</strong> {proyectoSeleccionado.titulo}</p>
                                            <p><strong>Descripción:</strong> {proyectoSeleccionado.descripcion}</p>
                                            <p><strong>Autores:</strong> {proyectoSeleccionado.autores.join(", ")}</p>
                                            <p><strong>Tecnologías:</strong> {proyectoSeleccionado.tecnologias.join(", ")}</p>
                                            <Form.Group controlId="motivoSolicitud">
                                                <Form.Label>Motivo de la solicitud</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={motivo}
                                                    onChange={(e) => setMotivo(e.target.value)}
                                                    placeholder="Escribe el motivo..."
                                                />
                                            </Form.Group>
                                        </>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="primary" onClick={solicitarAcceso}>Solicitar Acceso al Código</Button>
                                    <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componente de vista en lista
const ListView = ({ proyectos, onVerDetalles }) => {
    return (
        <div className="list-view">
            {proyectos.map((proyecto) => (
                <div key={proyecto.id} className="list-item mb-3 p-3 border" onClick={() => onVerDetalles(proyecto)}>
                    <h4>{proyecto.titulo} <span style={{ fontSize: "0.9rem" }}>({proyecto.tipo})</span></h4>
                    <p><strong>Autores:</strong> {proyecto.autores.join(", ")}</p>
                    <p>{proyecto.descripcion}</p>
                    <p><strong>Tecnologías:</strong> {proyecto.tecnologias.join(", ")}</p>
                </div>
            ))}
        </div>
    );
};

// Componente de vista en cuadrícula
const GridView = ({ proyectos, onVerDetalles }) => {
    return (
        <Row className="grid-view">
            {proyectos.map((proyecto) => (
                <Col key={proyecto.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                    <Card onClick={() => onVerDetalles(proyecto)}>
                        <Card.Body>
                            <Card.Title>{proyecto.titulo} <span style={{ fontSize: "0.8rem" }}>({proyecto.tipo})</span></Card.Title>
                            <Card.Text><strong>Autores:</strong> {proyecto.autores.join(", ")}</Card.Text>
                            <Card.Text>{proyecto.descripcion}</Card.Text>
                            <Card.Text><strong>Tecnologías:</strong> {proyecto.tecnologias.join(", ")}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default DashboardProfesor;
