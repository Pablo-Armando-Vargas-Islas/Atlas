// VerProyectosCurso.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import ProyectoModal from '../../../utils/ProyectoModal';
import '../../../styles/GestionCursosProfesor.css'; // Utilizar el CSS de GestionCursosProfesor

const VerProyectosCurso = () => {
    const { cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [curso, setCurso] = useState({});
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
            const solicitudPendiente = await verificarSolicitudPendiente(proyectoId);
            if (solicitudPendiente) {
                alert('Ya existe una solicitud pendiente para este proyecto.');
                return;
            }

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
                cerrarModal();
            } else {
                alert('Error al enviar la solicitud');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
        }
    };

    // Función para verificar si ya existe una solicitud pendiente antes de enviar una nueva solicitud
    const verificarSolicitudPendiente = async (proyectoId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes/verificar/${proyectoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data.pendiente;
            } else {
                console.error('Error al verificar la solicitud pendiente');
                return false;
            }
        } catch (error) {
            console.error('Error al verificar la solicitud pendiente:', error);
            return false;
        }
    };

    return (
        <div className="ver-proyectos-curso-container">
            <div className="gestion-cursos-main-content"> {/* Usar la clase existente para contenido principal */}
                <h1 className="text-center my-4">Proyectos en {curso.nombre_curso}</h1>
                {proyectos.length === 0 ? (
                    <p className="text-center">No hay proyectos entregados en este curso.</p>
                ) : (
                    <Table responsive bordered hover className="gestion-cursos-table mt-4"> {/* Cambiar la clase de la tabla */}
                        <thead>
                            <tr>
                                <th className="text-center">Título del Proyecto</th>
                                <th className="text-center">Descripción</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id}>
                                    <td className="text-center">{proyecto.titulo}</td>
                                    <td className="text-center">{proyecto.descripcion}</td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-primary"
                                            className="detalle-proyecto-btn" 
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
                    enviarSolicitud={enviarSolicitud} // Pasando enviarSolicitud como prop
                />
            )}
        </div>
    );
};

export default VerProyectosCurso;
