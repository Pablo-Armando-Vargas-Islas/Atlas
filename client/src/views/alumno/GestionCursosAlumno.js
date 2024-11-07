import React, { useState, useEffect } from 'react';
import { Table, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye} from 'react-icons/fa';
import '../../styles/GestionCursosProfesor.css';

const GestionCursosAlumno = () => {
    const [cursos, setCursos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch para obtener los cursos donde el alumno ha subido proyectos
        const fetchCursos = async () => {
            try {
                const token = localStorage.getItem('token'); // Usar token para autenticación
                const response = await fetch('http://localhost:5000/api/cursos/alumno/cursos', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setCursos(data);
            } catch (error) {
                console.error('Error al obtener los cursos del alumno:', error);
            }
        };

        fetchCursos();
    }, []);

    const handleSearchChange = (e) => {
        setBusqueda(e.target.value.toLowerCase());
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= Math.ceil(cursos.length / itemsPerPage)) {
            setCurrentPage(pageNumber);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCursos = cursos.slice(indexOfFirstItem, indexOfLastItem);

    const renderPagination = () => (
        <div className="paginacion">
            {Array.from({ length: Math.ceil(cursos.length / itemsPerPage) }, (_, index) => (
                <button
                    key={index}
                    className={`boton-pagina ${currentPage === index + 1 ? 'activo' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );

    return (
        <div className="gestion-cursos-profesor-container">
            <div className="gestion-cursos-main-content">
                <h1 className="text-center my-4">Mis Cursos</h1>
                <div className="buscador-y-boton">
                    <input
                        type="text"
                        placeholder="Buscar curso"
                        value={busqueda}
                        onChange={handleSearchChange}
                        className="buscador-cursos"
                    />
                </div>
                {currentCursos.length === 0 ? (
                    <p className="text-center">No has subido proyectos en ningún curso.</p>
                ) : (
                    <>
                        <Table responsive bordered hover className="gestion-cursos-table mt-4">
                            <thead className="table-header">
                                <tr>
                                    <th className="text-center">Nombre del Curso</th>
                                    <th className="text-center">Periodo Escolar</th>
                                    <th className="text-center">Código del Curso</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCursos
                                    .filter(curso => 
                                        curso.nombre_curso.toLowerCase().includes(busqueda) ||
                                        curso.periodo.toLowerCase().includes(busqueda) ||
                                        curso.codigo_curso.toLowerCase().includes(busqueda) ||
                                        curso.estado.toLowerCase().includes(busqueda)
                                    )
                                    .map((curso) => (
                                        <tr key={curso.id}>
                                            <td className="text-center">{curso.nombre_curso}</td>
                                            <td className="text-center">{curso.periodo}</td>
                                            <td className="text-center">{curso.codigo_curso}</td>
                                            <td className="text-center">{curso.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</td>
                                            <td className="text-center">
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Ver Proyectos</Tooltip>}>
                                                    <Button
                                                        variant="link"
                                                        className="p-0 ver-proyectos-btn align-middle"
                                                        onClick={() => navigate(`/alumno/curso/${curso.id}/proyectos`)}
                                                    >
                                                        <FaEye />
                                                    </Button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default GestionCursosAlumno;
