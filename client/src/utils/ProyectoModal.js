import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import BotonDescargaAdmin from '../utils/BotonDescargaAdmin'; 
import API_URL from '../Server';
import '../styles/ProyectoModal.css';

 
const ProyectoModal = ({ show, handleClose, proyecto, enviarSolicitud, omitDetails = false }) => {
    const { rol: userRole, userId } = useContext(AuthContext); 
    const [isMotivoStage, setIsMotivoStage] = useState(omitDetails);
    const [motivo, setMotivo] = useState('');
    const [isMotivoValid, setIsMotivoValid] = useState(false);
    const [puedeDescargar, setPuedeDescargar] = useState(false);
    const [puedeEditar, setPuedeEditar] = useState(false);
    const navigate = useNavigate();

    const handleMotivoChange = (e) => {
        const value = e.target.value;
        setMotivo(value);
        setIsMotivoValid(value.trim().length > 0);
    };

    const handleSolicitarAcceso = () => {
        setIsMotivoStage(true);
    };

    const handleEnviarSolicitud = () => {
        enviarSolicitud(proyecto.id, motivo);
        handleClose();
    };

    useEffect(() => {
        setIsMotivoStage(omitDetails);
    }, [omitDetails]);

    useEffect(() => {
        if (userId && proyecto && proyecto.usuario_id) {
            const usuarioIdProyecto = String(proyecto.usuario_id);
            const idUsuarioAutenticado = String(userId);
            
            if (userRole === 1) {
                setPuedeEditar(true);
            } else if (usuarioIdProyecto === idUsuarioAutenticado || (userRole === 2 && proyecto.codigo_curso)) {
                setPuedeDescargar(true);
            } else {
                setPuedeDescargar(false);
                setPuedeEditar(false);
            }
        }
    }, [userRole, userId, proyecto]);

    // Modal para administradores
    if (puedeEditar) {
        return (
            <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <p><strong>Título:</strong> {proyecto.titulo}</p>
                        <p><strong>Descripción:</strong> {proyecto.descripcion}</p>
                        <p><strong>¿Necesita licencia?:</strong> {proyecto.necesita_licencia ? "Sí" : "No"}</p>
                        {proyecto.necesita_licencia && (
                            <p><strong>Descripción de la licencia:</strong> {proyecto.descripcion_licencia}</p>
                        )}
                        <p><strong>Archivo Comprimido:</strong> {userRole === 1 ? proyecto.ruta_archivo_comprimido : proyecto.ruta_archivo_comprimido.split('\\').pop()}</p>
                        <p><strong>Tipo de Proyecto:</strong> {proyecto.tipo}</p>
                        {proyecto.tipo === 'aula' && (
                            <p><strong>Curso:</strong> {proyecto.nombre_curso}</p>
                        )}
                        <p><strong>Autores:</strong> {proyecto.autores.join(", ")}</p>
                        <p><strong>Tecnologías:</strong> {proyecto.tecnologias.join(", ")}</p>
                        <p><strong>Categorías:</strong> {proyecto.categorias.join(", ")}</p>
                    </>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" className='btn-primary-editar' onClick={() => navigate(`/admin/editar-proyecto/${proyecto.id}`)}>
                        Editar
                    </Button>
                    {proyecto.ruta_archivo_comprimido && (
                        <BotonDescargaAdmin id={proyecto.id} />
                    )}
                </Modal.Footer>
            </Modal>
        );
    }
    
    // Modal para dueños del proyecto y docentes
    if (puedeDescargar) {
        return (
            <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <p><strong>Título:</strong> {proyecto.titulo}</p>
                        <p><strong>Descripción:</strong> {proyecto.descripcion}</p>
                        <p><strong>¿Necesita licencia?:</strong> {proyecto.necesita_licencia ? "Sí" : "No"}</p>
                        {proyecto.necesita_licencia && (
                            <p><strong>Descripción de la licencia:</strong> {proyecto.descripcion_licencia}</p>
                        )}
                        <p><strong>Archivo Comprimido:</strong> {userRole === 1 ? proyecto.ruta_archivo_comprimido : proyecto.ruta_archivo_comprimido.split('\\').pop()}</p>
                        <p><strong>Tipo de Proyecto:</strong> {proyecto.tipo}</p>
                        {proyecto.tipo === 'aula' && (
                            <p><strong>Curso:</strong> {proyecto.nombre_curso}</p>
                        )}
                        <p><strong>Autores:</strong> {proyecto.autores.join(", ")}</p>
                        <p><strong>Tecnologías:</strong> {proyecto.tecnologias.join(", ")}</p>
                        <p><strong>Categorías:</strong> {proyecto.categorias.join(", ")}</p>
                    </>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                    {proyecto.ruta_archivo_comprimido && (
                        <BotonDescargaAdmin id={proyecto.id} />
                    )}
                </Modal.Footer>
            </Modal>
        );
    }

    // Modal para usuarios que no tienen acceso al proyecto
    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
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
                            {proyecto.tipo === 'aula' && (
                                <p><strong>Curso:</strong> {proyecto.nombre_curso}</p>
                            )}
                            <p><strong>Autores:</strong> {proyecto.autores.join(', ')}</p>
                            <p><strong>Tecnologías:</strong> {proyecto.tecnologias.join(', ')}</p>
                            <p><strong>Categorías:</strong> {proyecto.categorias.join(', ')}</p>
                        </>
                    )
                )}
            </Modal.Body>
            <Modal.Footer>
                {isMotivoStage ? (
                    <>
                        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                        <Button
                            className='btn-solicitar-acceso'
                            onClick={handleEnviarSolicitud}
                            disabled={!isMotivoValid}
                        >
                            Enviar Solicitud
                        </Button>
                    </>
                ) : (
                    <Button className='btn-solicitar-acceso' onClick={handleSolicitarAcceso}>Solicitar Acceso</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ProyectoModal;
