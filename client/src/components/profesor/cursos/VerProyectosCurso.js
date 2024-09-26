import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Modal } from 'react-bootstrap';
import Sidebar from '../../Sidebar';

const VerProyectosCurso = () => {
    const { cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [curso, setCurso] = useState({});
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false); // Estado para el indicador de carga

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

    // Función para abrir el modal con la información del proyecto seleccionado
    const verDetalles = (proyecto) => {
        setLoading(true); 
        setShowModal(true); 
    
        // Guardar el proyecto seleccionado en el estado
        setProyectoSeleccionado(proyecto);
        setLoading(false); // Cambiar el estado de carga a falso
    };
    

    const cerrarModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    return (
        <div className="profesor-container">
            <Sidebar />
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

            {/* Modal para mostrar los detalles del proyecto */}
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
                                <p><strong>¿Necesita licencia?:</strong> {proyectoSeleccionado.necesita_licencia ? "Sí" : "No"}</p>
                                {proyectoSeleccionado.necesita_licencia && (
                                    <p><strong>Descripción de la licencia:</strong> {proyectoSeleccionado.descripcion_licencia}</p>
                                )}
                                <p><strong>Autores:</strong> {proyectoSeleccionado.autores ? proyectoSeleccionado.autores.join(', ') : 'N/A'}</p>
                                <p><strong>Tecnologías:</strong> {proyectoSeleccionado.tecnologias ? proyectoSeleccionado.tecnologias.join(', ') : 'N/A'}</p>
                                <p><strong>Categorías:</strong> {proyectoSeleccionado.categorias ? proyectoSeleccionado.categorias.join(', ') : 'N/A'}</p>
                            </>
                        )
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary">Solicitar Acceso al Código</Button>
                    <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VerProyectosCurso;
