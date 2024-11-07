import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../styles/GestionCursosProfesor.css';
import '../../styles/EditarUsuarios.css';

const CursosProyectos = () => {
    const [cursos, setCursos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [cara, setCara] = useState('mas'); // Estado para controlar la cara de la tabla
    const cursosPorPagina = 10;
    const navigate = useNavigate();
    const API_URL = 'http://localhost:5000/api/metricas';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const endpoint = cara === 'mas' ? '/cursos/mas-proyectos' : '/cursos/menos-proyectos';
                const response = await fetch(`${API_URL}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud.');
                }
                const data = await response.json();
                setCursos(data);
            } catch (error) {
                console.error('Error al obtener los cursos:', error.message);
            }
        };

        fetchCursos();
    }, [cara]);

    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
    };

    // Calcular los cursos a mostrar en la página actual
    const indexOfLastCurso = currentPage * cursosPorPagina;
    const indexOfFirstCurso = indexOfLastCurso - cursosPorPagina;
    const currentCursos = cursos.slice(indexOfFirstCurso, indexOfLastCurso);

    // Cambiar de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Calcular el número total de páginas
    const totalPages = Math.ceil(cursos.length / cursosPorPagina);

    // Cambiar entre "más proyectos" y "menos proyectos"
    const toggleCara = () => {
        setCara((prevCara) => (prevCara === 'mas' ? 'menos' : 'mas'));
        setCurrentPage(1); // Reiniciar a la primera página al cambiar de cara
    };

    return (
        <div className="ver-proyectos-curso-container">
            <div className="gestion-cursos-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center my-4">
                    {cara === 'mas' ? 'Cursos con Más Proyectos' : 'Cursos con Menos Proyectos'}
                </h1>
                <div className="toggle-button-container text-center mb-4">
                    <button className="toggle-button" onClick={toggleCara}>
                        {cara === 'mas' ? 'Mostrar Cursos con Menos Proyectos' : 'Mostrar Cursos con Más Proyectos'}
                    </button>
                </div>
                {cursos.length > 0 ? (
                    <>
                        <Table responsive bordered hover className="gestion-cursos-table mt-4">
                            <thead>
                                <tr>
                                    <th className="text-center">Nombre del Curso</th>
                                    <th className="text-center">Cantidad de Proyectos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCursos.map((curso) => (
                                    <tr key={curso.id}>
                                        <td className="text-center">{curso.nombre_curso}</td>
                                        <td className="text-center">{curso.cantidad_proyectos}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className="paginacion">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    className={`boton-pagina ${currentPage === index + 1 ? 'activo' : ''}`}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-center">Cargando detalles de los cursos...</p>
                )}
            </div>
        </div>
    );
};

export default CursosProyectos;
