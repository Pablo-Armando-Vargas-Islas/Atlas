import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, OverlayTrigger, Tooltip  } from 'react-bootstrap';
import ProyectoModal from '../../utils/ProyectoModal';
import { FaArrowLeft, FaList } from 'react-icons/fa';
import '../../styles/GestionCursosProfesor.css';

const VerProyectosAlumnoCurso = () => {
    const { cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [curso, setCurso] = useState({});
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { 
        const fetchProyectos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/cursos/curso/${cursoId}/proyectos/alumno`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                console.log("Datos del curso obtenidos:", data.curso); // Depuración
                console.log("Proyectos obtenidos:", data.proyectos);   // Depuración
                setProyectos(data.proyectos);
                setCurso(data.curso);
            } catch (error) {
                console.error('Error al obtener los proyectos:', error);
            }
        };
    
        fetchProyectos();
    }, [cursoId]);
    

    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
    };

    // Función para abrir el modal con los detalles del proyecto seleccionado
    const verDetalles = (proyecto) => {
        const proyectoConCurso = { ...proyecto, nombre_curso: curso.nombre_curso };
        setProyectoSeleccionado(proyectoConCurso);
        setShowModal(true);
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    function VerProyectosAlumnoCurso({ curso, proyectos }) {
        if (!curso) {
            return <div>Loading...</div>;
        }
    
        return (
            <div>
                <h2>{curso.nombre_curso}</h2>
                {/* Renderizar los proyectos aquí */}
            </div>
        );
    }    

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
            <div className="gestion-cursos-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center my-4">
                    {curso ? `Proyectos en ${curso.nombre_curso}` : 'Cargando curso...'}
                </h1>
                {proyectos.length === 0 ? (
                    <p className="text-center">No hay proyectos entregados en este curso.</p>
                ) : (
                    <Table responsive bordered hover className="gestion-cursos-table mt-4">
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
                                    <OverlayTrigger placement="top" overlay={<Tooltip>Ver detalles</Tooltip>}>
                                        <Button
                                            variant="link"
                                            className="p-0 ver-proyectos-btn align-middle" 
                                            onClick={() => verDetalles(proyecto)}
                                        >
                                            <FaList />
                                        </Button>
                                    </OverlayTrigger>
                                    </td> 
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
    
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

export default VerProyectosAlumnoCurso;
