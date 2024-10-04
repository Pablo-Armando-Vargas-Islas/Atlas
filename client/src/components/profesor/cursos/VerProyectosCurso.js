import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import ProyectoModal from '../../ProyectoModal'; // Importar el componente del modal reutilizable

const VerProyectosCurso = () => {
    const { cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [curso, setCurso] = useState({});
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); // Proyecto seleccionado para el modal
    const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal

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

    // Función para abrir el modal con los detalles del proyecto seleccionado
    const verDetalles = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setShowModal(true);
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    // Función para enviar la solicitud de acceso
    const enviarSolicitud = async (proyectoId, motivo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/solicitudes/crear', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proyecto_id: proyectoId,
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

            {/* Modal reutilizable para mostrar detalles del proyecto */}
            {proyectoSeleccionado && (
                <ProyectoModal
                    show={showModal}
                    handleClose={cerrarModal}
                    proyecto={proyectoSeleccionado}
                    enviarSolicitud={enviarSolicitud}
                />
            )}
        </div>
    );
};

export default VerProyectosCurso;
