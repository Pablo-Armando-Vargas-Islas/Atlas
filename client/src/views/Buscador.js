import React, { useState } from "react";
import { Card, Button, InputGroup, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../styles/Buscador.css';

const BuscadorBox = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/buscador/busqueda-global?query=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="buscador-box d-flex flex-column align-items-center">
            <h1 className="buscador-title mb-4">Buscador Atlas</h1>
            
            {/* Barra de búsqueda global */}
            <InputGroup className="search-bar mb-4">
                <Form.Control
                    type="text"
                    placeholder="Buscar en el sistema"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary" className="search-button-buscador" onClick={handleSearch}>
                    Buscar
                </Button>
            </InputGroup>

            {/* Botones para búsquedas especializadas */}
            <div className="buttons-container d-flex flex-wrap justify-content-center">
                {[
                    { title: "Mis Proyectos", route: "/buscador/mis-proyectos" },
                    { title: "Navegar por Título", route: "/buscador/navegar-por-titulo" },
                    { title: "Navegar por Autor", route: "/buscador/navegar-por-autor" },
                    { title: "Navegar por Fecha", route: "/buscador/navegar-por-fecha" },
                    { title: "Navegar por Cursos", route: "/buscador/navegar-por-cursos" },
                    { title: "Navegar por Categoría", route: "/buscador/navegar-por-categoria" },
                ].map((button, index) => (
                    <Card key={index} className="button-card m-3" onClick={() => navigate(button.route)}>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <Card.Title>{button.title}</Card.Title>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BuscadorBox;
