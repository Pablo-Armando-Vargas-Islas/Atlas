import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import Sidebar from '../../Sidebar';

const CrearCursoProfesor = () => {
    const [nombreCurso, setNombreCurso] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [fechaLimite, setFechaLimite] = useState('');
    const [codigoCurso, setCodigoCurso] = useState('');
    const [entregasLibres, setEntregasLibres] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Generar código de curso de 6 caracteres
    const generarCodigoCurso = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        setCodigoCurso(codigo);
    };

    // Copiar código al portapapeles
    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigoCurso);
        alert('Código copiado al portapapeles: ' + codigoCurso);
    };

    // Manejar la creación del curso
    const crearCurso = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!nombreCurso || !periodo || (!entregasLibres && !fechaLimite)) {
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const body = { nombreCurso, periodo, fechaLimite, entregasLibres, codigoCurso };

            const response = await fetch('http://localhost:5000/api/cursos/crearCurso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Agrega el token en los headers
                },
                body: JSON.stringify(body),
            });
            

            if (response.ok) {
                alert('Curso creado exitosamente.');
                navigate('/profesor/cursos'); // Redirige a la vista de gestión de cursos
            } else {
                setErrorMessage('Error al crear el curso.');
            }
        } catch (err) {
            console.error(err.message);
            setErrorMessage('Error de conexión.');
        }
    };

    return (
        <div className="profesor-container">
            <Sidebar />
            <div className="main-content">
                <h1 className="text-center mt-5">Crear Curso</h1>
                <Form onSubmit={crearCurso} className="mt-5">
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    <Form.Group>
                        <Form.Label>Nombre del Curso</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombreCurso}
                            onChange={(e) => setNombreCurso(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Periodo Escolar</Form.Label>
                        <Form.Control
                            type="text"
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label="Entregas Libres (Sin Fecha Límite)"
                            checked={entregasLibres}
                            onChange={(e) => setEntregasLibres(e.target.checked)}
                        />
                    </Form.Group>

                    {!entregasLibres && (
                        <Form.Group>
                            <Form.Label>Fecha Límite</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaLimite}
                                onChange={(e) => setFechaLimite(e.target.value)}
                                required={!entregasLibres}
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="d-flex align-items-center">
                        <Button variant="primary" onClick={generarCodigoCurso}>
                            Generar Código de Curso
                        </Button>
                        <Form.Control
                            type="text"
                            className="ml-3"
                            value={codigoCurso}
                            readOnly
                            required
                        />
                        <Button variant="secondary" className="ml-3" onClick={copiarCodigo}>
                            Copiar Código
                        </Button>
                    </Form.Group>

                    <Button type="submit" className="mt-3" variant="success">
                        Crear Curso
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default CrearCursoProfesor;
