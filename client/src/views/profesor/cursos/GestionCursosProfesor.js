import React, { useState, useEffect } from 'react';
import { Button, Table, OverlayTrigger, Tooltip, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaClipboard, FaFileCode, FaLock, FaUnlock, FaPlusCircle } from 'react-icons/fa';
import '../../../styles/GestionCursosProfesor.css';

const API_URL = 'http://localhost:5000';

const GestionCursosProfesor = () => {
    const [cursos, setCursos] = useState([]);
    const [tooltipText, setTooltipText] = useState({});
    const [cursoIdModificar, setCursoIdModificar] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [accion, setAccion] = useState('');
    const [nuevaFechaLimite, setNuevaFechaLimite] = useState('');
    const [fechaInvalida, setFechaInvalida] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { 
        const fetchCursos = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await fetch(`${API_URL}/api/cursos/cursos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setCursos(data);

                const initialTooltipText = {};
                data.forEach((curso) => {
                    initialTooltipText[curso.id] = 'Copiar Código';
                });
                setTooltipText(initialTooltipText);


            } catch (error) {
                console.error('Error al obtener los cursos:', error);
            }
        };

        fetchCursos();
    }, []);

     const copiarCodigo = (curso) => {
        const mensaje = `Hola este es el código del curso de *${curso.nombre_curso}*:\n${curso.codigo_curso}`;
        navigator.clipboard.writeText(mensaje);

        setTooltipText((prevState) => ({
            ...prevState,
            [curso.id]: 'Copiado!'
        }));

        setTimeout(() => {
            setTooltipText((prevState) => ({
                ...prevState,
                [curso.id]: 'Copiar Código'
            }));
        }, 1500);
    };

    const irACrearCurso = () => {
        navigate('/profesor/crearCurso');
    };

    const abrirModalAccionCurso = (cursoId, accion) => {
        setCursoIdModificar(cursoId);
        setAccion(accion);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setCursoIdModificar(null);
        setAccion('');
        setNuevaFechaLimite('');
        setFechaInvalida(false);
    };

    const modificarEstadoCurso = async () => {

        if (accion === 'abrir' && !nuevaFechaLimite) {
            alert('Por favor, seleccione una fecha límite antes.');
            return;
        }

        if (cursoIdModificar) {
            try {
                const token = localStorage.getItem('token');
                const endpoint = accion === 'cerrar' ? 'cerrarCurso' : 'abrirCurso';
                const body = accion === 'abrir' ? JSON.stringify({ nuevaFechaLimite }) : null;

                const response = await fetch(`${API_URL}/api/cursos/${endpoint}/${cursoIdModificar}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: body,
                });
                if (response.ok) {
                    setCursos(cursos.map(curso =>
                        curso.id === cursoIdModificar
                            ? { 
                                ...curso, 
                                estado: accion === 'cerrar' ? 'cerrado' : 'abierto', 
                                fecha_fin: accion === 'cerrar' ? new Date().toISOString().split('T')[0] : nuevaFechaLimite 
                              }
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

    const handleFechaLimiteChange = (e) => {
        const fechaSeleccionada = e.target.value;
        const hoy = new Date().toISOString().split('T')[0];
        setNuevaFechaLimite(fechaSeleccionada);
        setFechaInvalida(fechaSeleccionada <= hoy);
    };

    return (
        <div className="gestion-cursos-profesor-container">
            <div className="gestion-cursos-main-content">
                <h1 className="text-center my-4">Gestión de Cursos</h1>
                    <Button 
                        variant="primary" 
                        onClick={irACrearCurso} 
                        className="crear-curso-button"
                    >
                        <FaPlusCircle className="mr-2" /> Crear nuevo curso
                    </Button>
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
                                                <FaFileCode />
                                            </Button>
                                        </OverlayTrigger>{' '}
                                        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltipText[curso.id]}</Tooltip>}>
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
                        <p>¿Estás seguro de que deseas cerrar este curso? Ya no se permitirán más entregas.</p>
                    ) : (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Por favor, para abrir el curso elige una nueva fecha límite.</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={nuevaFechaLimite}
                                    onChange={handleFechaLimiteChange}
                                    required
                                />
                                {fechaInvalida && <Form.Text className="text-danger">La fecha no puede ser igual o anterior al día de hoy.</Form.Text>}
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
