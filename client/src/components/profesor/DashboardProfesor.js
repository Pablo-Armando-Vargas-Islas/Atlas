import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, InputGroup, Nav } from "react-bootstrap";
import { FaList, FaThLarge } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { jwtDecode as jwt_decode } from "jwt-decode"; 
import '../styles/DashboardProfesor.css'; 

const DashboardProfesor = () => {
    const [proyectos, setProyectos] = useState([]);
    const [viewMode, setViewMode] = useState("list"); // Modo de vista: list o grid
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("misProyectos"); // Pestaña activa
    const [sidebarOpen, setSidebarOpen] = useState(false); // Estado para el sidebar
    const [userId, setUserId] = useState(null); // ID del usuario

    // Obtener ID del usuario desde el token almacenado
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwt_decode(token);
            if (decodedToken && decodedToken.id) {
                setUserId(decodedToken.id);  // Solo asigna el userId si el token está bien decodificado
            } else {
                console.error("Token inválido o sin id");  
            }
        }
    }, []);
    

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
    

    
    
    

    // Filtrar proyectos por búsqueda (solo en "Mis proyectos")
    const filteredProyectos = proyectos.filter((proyecto) =>
        proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content */}
            <div className={`main-content ${sidebarOpen ? "expanded" : ""}`}>
                {/* Navegación por pestañas (estilo carpetas) */}
                <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedTab) => setActiveTab(selectedTab)}>
                    <Nav.Item>
                        <Nav.Link eventKey="misProyectos">Mis Proyectos</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="misCursos">Cursos</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="buscarAtlas">Atlas</Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* Contenido según la pestaña activa */}
                <div className="tab-content mt-4">
                    {activeTab === "misProyectos" && (
                        <>
                            {/* Barra de búsqueda y filtros */}
                            <div className="search-bar-container mb-4">
                                <InputGroup className="search-bar">
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar proyectos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                    <Button variant="primary" className="search-button">
                                        Buscar
                                    </Button>
                                </InputGroup>
                                {/* Agregar filtros como ordenar por fecha, categoría, tecnologías, etc. */}
                            </div>

                            {/* Contenedor de proyectos con selector de vista */}
                            <div className="projects-container">
                                <div className="projects-header d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Mis Proyectos</h5>
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
                                        <ListView proyectos={filteredProyectos} />
                                    ) : (
                                        <GridView proyectos={filteredProyectos} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "misCursos" && (
                        <div>
                            <h5>Proyectos en mis Cursos</h5>
                            <p>Aquí se mostrarán los proyectos de los cursos que has creado.</p>
                        </div>
                    )}

                    {activeTab === "buscarAtlas" && (
                        <div>
                            <h5>Buscar proyecto en Atlas</h5>
                            <p>Esta sección mostrará los proyectos más populares, y permitirá buscar en el catálogo de proyectos de Atlas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componente de vista de lista
const ListView = ({ proyectos }) => {
    return (
        <div className="list-view">
            {proyectos.map((proyecto) => (
                <div key={proyecto.id} className="list-item mb-3 p-3">
                    <h4>{proyecto.titulo} <span style={{ fontSize: "0.9rem" }}>({proyecto.tipo})</span></h4>
                    <p style={{ fontSize: "0.85rem" }}><strong>Autores:</strong> {proyecto.autores.join(", ")}</p>
                    <p>{proyecto.descripcion}</p>
                    <p style={{ fontSize: "0.85rem" }}><strong>Tecnologías:</strong> {proyecto.tecnologias.join(", ")}</p>
                </div>
            ))}
        </div>
    );
};

// Componente de vista de cuadrícula
const GridView = ({ proyectos }) => {
    return (
        <Row className="grid-view">
            {proyectos.map((proyecto) => (
                <Col key={proyecto.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                    <Card>
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
