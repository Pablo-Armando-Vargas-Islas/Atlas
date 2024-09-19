import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import Sidebar from '../../Sidebar';

const VerProyectosCurso = () => {
    const { cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [curso, setCurso] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch para obtener los proyectos del curso seleccionado
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
                                <th>Autores</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id}>
                                    <td>{proyecto.titulo}</td>
                                    <td>{proyecto.autores.join(', ')}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => navigate(`/profesor/proyecto/${proyecto.id}`)}
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
        </div>
    );
};

export default VerProyectosCurso;
