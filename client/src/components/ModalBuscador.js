import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProyectoModal = ({ show, handleClose, proyecto, enviarSolicitud }) => {
    const [motivo, setMotivo] = useState('');
    const [isMotivoValid, setIsMotivoValid] = useState(false); // Valida si el motivo es válido

    const handleMotivoChange = (e) => {
        const value = e.target.value;
        setMotivo(value);
        setIsMotivoValid(value.trim().length > 0); // Validar que no esté vacío
    };

    const handleEnviarSolicitud = () => {
        enviarSolicitud(proyecto.id, motivo);
        handleClose(); // Cerrar el modal tras enviar la solicitud
    };

    return (
        <Modal show={show} onHide={handleClose} centered> {/* Agregar 'centered' para centrar el modal */}
            <Modal.Header closeButton>
                <Modal.Title>Solicitar Acceso al Proyecto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button
                    variant="primary"
                    onClick={handleEnviarSolicitud}
                    disabled={!isMotivoValid} // Deshabilitar el botón si el motivo no es válido
                >
                    Enviar Solicitud
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProyectoModal;
