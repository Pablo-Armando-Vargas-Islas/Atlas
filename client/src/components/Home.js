import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, ListGroup, ListGroupItem, Container, Row, Col } from "react-bootstrap";

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [proyectos, setProyectos] = useState([]);
    const navigate = useNavigate();


    const fetchProyectos = async () => {
        try {
            const response = await fetch("http://localhost:5000/proyectos");
            const data = await response.json();
            setProyectos(data);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        fetchProyectos();
    }, []);

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className={`bg-light p-3 ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`} style={{ minWidth: sidebarOpen ? "250px" : "0" }}>
                <div className="d-flex flex-column">
                    <div className="mb-4">
                        <h5>Perfil de Usuario</h5>
                        {/* Información del perfil del usuario */}
                    </div>
                    <ListGroup>
                        <ListGroupItem action>Inicio</ListGroupItem>
                        <ListGroupItem action>Proyectos de Grado</ListGroupItem>
                        <ListGroupItem action>Proyectos de Aula</ListGroupItem>
                    </ListGroup>
                    <div className="mt-auto">
                        <Button variant="danger" onClick={handleLogout}>Cerrar Sesión</Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Container fluid>
                <Row className="mt-4">
                    <Col>
                        <Button variant="primary" onClick={() => navigate("/input-proyectos")}>
                            Subir Nuevo Proyecto
                        </Button>
                    </Col>
                </Row>
                <Row className="mt-4">
                    {proyectos.map((proyecto) => (
                        <Col key={proyecto.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{proyecto.titulo}</Card.Title>
                                    <Card.Text>{proyecto.descripcion}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Home;
