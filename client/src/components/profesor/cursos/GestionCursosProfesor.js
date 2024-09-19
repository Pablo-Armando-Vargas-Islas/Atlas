import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Sidebar';

const GestionCursosProfesor = () => {
    const [cursos, setCursos] = useState([]);
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
    const copiarCodigo = (codigo) => {
        navigator.clipboard.writeText(codigo);
        alert('Código copiado al portapapeles: ' + codigo);
    };

    // Función para cerrar un curso
    const cerrarCurso = async (cursoId) => {
        const confirmacion = window.confirm('¿Estás seguro de que deseas cerrar este curso? No se permitirán más entregas.');
        if (confirmacion) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/profesores/cerrarCurso/${cursoId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    alert('Curso cerrado exitosamente.');
                    setCursos(cursos.filter(curso => curso.id !== cursoId)); // Actualizar lista de cursos
                } else {
                    alert('Error al cerrar el curso.');
                }
            } catch (error) {
                console.error('Error al cerrar el curso:', error);
            }
        }
    };

    return (
        <div className="profesor-container">
            <Sidebar />
            <div className="main-content">
                <h1 className="text-center mt-5">Gestionar Cursos Activos</h1>
                {cursos.length === 0 ? (
                    <p className="text-center">No tienes cursos activos en este momento.</p>
                ) : (
                    <Table striped bordered hover className="mt-5">
                        <thead>
                            <tr>
                                <th>Nombre del Curso</th>
                                <th>Periodo Escolar</th>
                                <th>Código del Curso</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.map((curso) => (
                                <tr key={curso.id}>
                                    <td>{curso.nombre_curso}</td>
                                    <td>{curso.periodo}</td>
                                    <td>
                                        {curso.codigo_curso}{' '}
                                        <Button variant="outline-secondary" onClick={() => copiarCodigo(curso.codigo_curso)}>
                                            Copiar Código
                                        </Button>
                                    </td>
                                    <td>{curso.estado === 'abierto' ? 'Recibiendo Entregas' : 'Cerrado'}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => navigate(`/profesor/curso/${curso.id}/proyectos`)}
                                        >
                                            Ver Proyectos
                                        </Button>{' '}
                                        {curso.estado === 'abierto' && (
                                            <Button variant="outline-danger" onClick={() => cerrarCurso(curso.id)}>
                                                Cerrar Curso
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default GestionCursosProfesor;
