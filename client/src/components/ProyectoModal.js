import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProyectoModal = ({ show, handleClose, proyecto, enviarSolicitud }) => {
    const [isMotivoStage, setIsMotivoStage] = useState(false); // Controla si está en la etapa de motivo
    const [motivo, setMotivo] = useState('');
    const [isMotivoValid, setIsMotivoValid] = useState(false); // Valida si el motivo es válido

    const handleMotivoChange = (e) => {
        const value = e.target.value;
        setMotivo(value);
        setIsMotivoValid(value.trim().length > 0); // Validar que no esté vacío
    };

    const handleSolicitarAcceso = () => {
        setIsMotivoStage(true); // Cambia a la etapa de motivo
    };

    const handleEnviarSolicitud = () => {
        enviarSolicitud(proyecto.id, motivo);
        handleClose(); // Cerrar el modal tras enviar la solicitud
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{isMotivoStage ? 'Solicitar Acceso al Proyecto' : 'Detalles del Proyecto'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isMotivoStage ? (
                    <Form.Group controlId="motivoSolicitud">
                        <Form.Label>Motivo de la solicitud</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={motivo}
                            onChange={handleMotivoChange}
                            placeholder="Escribe el motivo por el cual solicitas acceso..."
                        />
                    </Form.Group>
                ) : (
                    proyecto && (
                        <>
                            <p><strong>Título:</strong> {proyecto.titulo}</p>
                            <p><strong>Descripción:</strong> {proyecto.descripcion}</p>
                            <p><strong>Autores:</strong> {proyecto.autores.join(', ')}</p>
                            <p><strong>Tecnologías:</strong> {proyecto.tecnologias.join(', ')}</p>
                        </>
                    )
                )}
            </Modal.Body>
            <Modal.Footer>
                {isMotivoStage ? (
                    <>
                        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                        <Button
                            variant="primary"
                            onClick={handleEnviarSolicitud}
                            disabled={!isMotivoValid} // Deshabilitar el botón si el motivo no es válido
                        >
                            Enviar Solicitud
                        </Button>
                    </>
                ) : (
                    <Button variant="primary" onClick={handleSolicitarAcceso}>Solicitar Acceso</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ProyectoModal;