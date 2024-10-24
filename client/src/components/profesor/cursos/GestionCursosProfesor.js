import React, { useState, useEffect } from 'react';
import { Button, Table, OverlayTrigger, Tooltip, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaClipboard, FaEye, FaLock, FaUnlock } from 'react-icons/fa';
import '../../styles/GestionCursosProfesor.css';

const GestionCursosProfesor = () => {
    const [cursos, setCursos] = useState([]);
    const [cursoIdModificar, setCursoIdModificar] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [accion, setAccion] = useState('');
    const [nuevaFechaLimite, setNuevaFechaLimite] = useState('');
    const [fechaInvalida, setFechaInvalida] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch para obtener los cursos activos del profesor
        const fetchCursos = async () => {
            try {
                const token = localStorage.getItem('token'); // Usar token para autenticación
                const response = await fetch('http://localhost:5000/api/cursos/cursos', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setCursos(data);
            } catch (error) {
                console.error('Error al obtener los cursos:', error);
            }
        };

        fetchCursos();
    }, []);

    // Función para copiar el código del curso al portapapeles
    const copiarCodigo = (curso) => {
        const mensaje = `Hola este es el código del curso de ${curso.nombre_curso}:
${curso.codigo_curso}`;
        navigator.clipboard.writeText(mensaje);
        alert('Código copiado al portapapeles: ' + curso.codigo_curso);
    };

    // Función para manejar la apertura del modal de confirmación de acción
    const abrirModalAccionCurso = (cursoId, accion) => {
        setCursoIdModificar(cursoId);
        setAccion(accion);
        setMostrarModal(true);
    };

    // Función para manejar el cierre del modal
    const cerrarModal = () => {
        setMostrarModal(false);
        setCursoIdModificar(null);
        setAccion('');
        setNuevaFechaLimite('');
        setFechaInvalida(false);
    };

    // Función para modificar el estado de un curso (abrir o cerrar)
    const modificarEstadoCurso = async () => {
        if (cursoIdModificar) {
            try {
                const token = localStorage.getItem('token');
                const endpoint = accion === 'cerrar' ? 'cerrarCurso' : 'abrirCurso';
                const body = accion === 'abrir' ? JSON.stringify({ nuevaFechaLimite }) : null;

                const response = await fetch(`http://localhost:5000/api/cursos/${endpoint}/${cursoIdModificar}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: body,
                });
                if (response.ok) {
                    alert(`Curso ${accion === 'cerrar' ? 'cerrado' : 'abierto'} exitosamente.`);
                    // Actualizar el estado del curso según la acción realizada
                    setCursos(cursos.map(curso =>
                        curso.id === cursoIdModificar
                            ? { ...curso, estado: accion === 'cerrar' ? 'cerrado' : 'abierto', fecha_fin: accion === 'abrir' ? nuevaFechaLimite : curso.fecha_fin }
                            : curso
                    ));
                } else {
                    alert('Error al modificar el curso.');
                }
            } catch (error) {
                console.error(`Error al ${accion} el curso:`, error);
            } finally {
                cerrarModal();
            }
        }
    };

    // Función para manejar el cambio de fecha límite y validar que no sea anterior a hoy
    const handleFechaLimiteChange = (e) => {
        const fechaSeleccionada = e.target.value;
        const hoy = new Date().toISOString().split('T')[0];
        setNuevaFechaLimite(fechaSeleccionada);
        setFechaInvalida(fechaSeleccionada < hoy);
    };

    return (
        <div className="gestion-cursos-profesor-container">
            <div className="gestion-cursos-main-content">
                <h1 className="text-center my-4">Gestión de Cursos</h1>
                {cursos.length === 0 ? (
                    <p className="text-center">No tienes cursos activos en este momento.</p>
                ) : (
                    <Table responsive bordered hover className="gestion-cursos-table mt-4">
                        <thead className="table-header">
                            <tr>
                                <th className="text-center">Nombre del Curso</th>
                                <th className="text-center">Periodo Escolar</th>
                                <th className="text-center">Código del Curso</th>
                                <th className="text-center">Fecha de Cierre</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.map((curso) => (
                                <tr key={curso.id}>
                                    <td className="text-center">{curso.nombre_curso}</td>
                                    <td className="text-center">{curso.periodo}</td>
                                    <td className="text-center">{curso.codigo_curso}</td>
                                    <td className="text-center">{curso.fecha_fin ? curso.fecha_fin.split('T')[0] : 'N/A'}</td>
                                    <td className="text-center">
                                        {curso.estado === 'abierto' ? (
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Cerrar Curso</Tooltip>}>
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-success cursor-pointer"
                                                    onClick={() => abrirModalAccionCurso(curso.id, 'cerrar')}
                                                >
                                                    <FaUnlock />
                                                </Button>
                                            </OverlayTrigger>
                                        ) : (
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Abrir Curso</Tooltip>}>
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-danger cursor-pointer"
                                                    onClick={() => abrirModalAccionCurso(curso.id, 'abrir')}
                                                >
                                                    <FaLock />
                                                </Button>
                                            </OverlayTrigger>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Ver Proyectos</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 ver-proyectos-btn align-middle"
                                                onClick={() => navigate(`/profesor/curso/${curso.id}/proyectos`)}
                                            >
                                                <FaEye />
                                            </Button>
                                        </OverlayTrigger>{' '}
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Copiar Código</Tooltip>}>
                                            <Button variant="link" className="p-0 copiar-codigo-btn ml-2 text-muted" onClick={() => copiarCodigo(curso)}>
                                                <FaClipboard />
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* Modal de confirmación para modificar el estado del curso */}
            <Modal show={mostrarModal} onHide={cerrarModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{accion === 'cerrar' ? 'Confirmar Cierre del Curso' : 'Confirmar Apertura del Curso'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {accion === 'cerrar' ? (
                        <p>¿Estás seguro de que deseas cerrar este curso? No se permitirán más entregas.</p>
                    ) : (
                        <>
                            <p>¿Estás seguro de que deseas abrir este curso? Se permitirá nuevamente la entrega de proyectos.</p>
                            <Form.Group className="mb-3">
                                <Form.Label>Nueva Fecha Límite</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={nuevaFechaLimite}
                                    onChange={handleFechaLimiteChange}
                                    required
                                />
                                {fechaInvalida && <Form.Text className="text-danger">La fecha no puede ser anterior al día de hoy.</Form.Text>}
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModal}>
                        Cancelar
                    </Button>
                    <Button
                        variant={accion === 'cerrar' ? 'danger' : 'success'}
                        onClick={modificarEstadoCurso}
                        disabled={accion === 'abrir' && fechaInvalida}
                    >
                        {accion === 'cerrar' ? 'Cerrar Curso' : 'Abrir Curso'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GestionCursosProfesor;
