import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import '../../../styles/CrearCursoProfesor.css';
 
const CrearCursoProfesor = () => {
    const [nombreCurso, setNombreCurso] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [fechaLimite, setFechaLimite] = useState('');
    const [entregasLibres] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [codigoCurso, setCodigoCurso] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    // Generar código de curso de 6 caracteres
    const generarCodigoCurso = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return codigo;
    };

    // Función para copiar el código al portapapeles
    const copiarMensaje = () => {
        const mensaje = `Hola este es el código del curso *${nombreCurso}*:\n${codigoCurso}`;
        navigator.clipboard.writeText(mensaje);
        setCopied(true);
    };

    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
    };

    const crearCurso = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const today = new Date().toISOString().split('T')[0];
        if (fechaLimite <= today) {
            setErrorMessage('La fecha límite no puede ser igual o anterior al día de hoy.');
            return;
        }

        if (!nombreCurso || !periodo || (!entregasLibres && !fechaLimite)) {
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const codigo = generarCodigoCurso();
            const body = { nombreCurso, periodo, fechaLimite, entregasLibres, codigoCurso: codigo };

            const response = await fetch('http://localhost:5000/api/cursos/crearCurso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setCodigoCurso(codigo);
                setShowModal(true);
            } else {
                setErrorMessage('Error al crear el curso.');
            }
        } catch (err) {
            console.error(err.message);
            setErrorMessage('Error de conexión.');
        }
    };

    // Función del cierre del modal
    const handleCloseModal = () => {
        setShowModal(false);
        setNombreCurso('');
        setPeriodo('');
        setFechaLimite('');
        setCopied(false);
    };

    const handleVerMisCursos = () => {
        navigate('/profesor/cursos');
    };

    // Obtener periodos segun el año
    const obtenerOpcionesPeriodo = () => {
        const currentYear = new Date().getFullYear();
        return [
            `A${currentYear}`,
            `B${currentYear}`
        ];
    };

    return (
        <div className="crear-curso-profesor-container">
            <div className="crear-curso-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center mb-4">Crear Curso</h1>
                <Form onSubmit={crearCurso}>
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Curso</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombreCurso}
                            onChange={(e) => setNombreCurso(e.target.value)}
                            required
                            className="crear-curso-input"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Periodo Escolar</Form.Label>
                        <Form.Control
                            as="select"
                            value={periodo}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setPeriodo(e.target.value)}
                            required
                            className="crear-curso-input"
                        >
                            <option value="" disabled>Selecciona un periodo</option>
                            {obtenerOpcionesPeriodo().map((opcion) => (
                                <option key={opcion} value={opcion}>{opcion}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha Límite</Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaLimite}
                            onChange={(e) => setFechaLimite(e.target.value)}
                            required
                            className="crear-curso-input"
                        />
                    </Form.Group>

                    <Button type="submit" className="crear-curso-submit-button w-100 mt-3" variant="success">
                        Crear Curso
                    </Button>
                </Form>
            </div>

            {/* Modal para mostrar el código del curso */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Código del Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>El código del curso <strong>{nombreCurso}</strong> es:</p>
                    <h3 className="text-center crear-curso-codigo"><strong>{codigoCurso}</strong></h3>
                    {copied ? (
                        <Button variant="primary" onClick={handleVerMisCursos} className="mt-3 w-100 crear-curso-ver-cursos-button">
                            Ver en mis cursos
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={copiarMensaje} className="mt-3 w-100 crear-curso-copiar-button">
                            Compartir Código
                        </Button>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CrearCursoProfesor;
