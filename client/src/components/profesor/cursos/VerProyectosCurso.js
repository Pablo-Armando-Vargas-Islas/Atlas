import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Agregar useNavigate para la redirección
import { Table, Button, Modal, Form } from 'react-bootstrap';

const VerProyectosCurso = () => {
    const { cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [curso, setCurso] = useState({});
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [motivo, setMotivo] = useState(''); // Motivo de la solicitud
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/cursos/curso/${cursoId}/proyectos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setProyectos(data.proyectos);
                setCurso(data.curso);
            } catch (error) {
                console.error('Error al obtener los proyectos:', error);
            }
        };

        fetchProyectos();
    }, [cursoId]);

    const verDetalles = (proyecto) => {
        setLoading(true);
        setShowModal(true);
        setProyectoSeleccionado(proyecto);
        setLoading(false);
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

    return (
        <div className="profesor-container">
            <div className="main-content">
                <h1 className="text-center mt-5">Proyectos en {curso.nombre_curso}</h1>
                {proyectos.length === 0 ? (
                    <p className="text-center">No hay proyectos entregados en este curso.</p>
                ) : (
                    <Table striped bordered hover className="mt-5">
                        <thead>
                            <tr>
                                <th>Título del Proyecto</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id}>
                                    <td>{proyecto.titulo}</td>
                                    <td>{proyecto.descripcion}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => verDetalles(proyecto)}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            <Modal show={showModal} onHide={cerrarModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Proyecto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        proyectoSeleccionado && (
                            <>
                                <p><strong>Título:</strong> {proyectoSeleccionado.titulo}</p>
                                <p><strong>Descripción:</strong> {proyectoSeleccionado.descripcion}</p>
                                {/* Aquí va el formulario para solicitar acceso */}
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
                        )
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={solicitarAcceso}>Solicitar Acceso al Código</Button>
                    <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VerProyectosCurso;
