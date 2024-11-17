import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../../styles/Buscador.css';

const ConfiguracionSistema = () => {
    const navigate = useNavigate();

    return (
        <div className="buscador-box d-flex flex-column align-items-center">
            <h1 className="buscador-title mb-4">Configuración del Sistema</h1>
            
            <div className="buttons-container d-flex flex-wrap justify-content-center">
                {[
                    { title: "Correo Institucional", route: "/configuracion/configurar-correo" },
                    { title: "Tecnologías", route: "/configuracion/editar-tecnologias" },
                    { title: "Categorías", route: "/configuracion/editar-categorias" },
                ].map((button, index) => (
                    <Card key={index} className="button-card-config m-3" onClick={() => navigate(button.route)}>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <Card.Title>{button.title}</Card.Title>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ConfiguracionSistema;
