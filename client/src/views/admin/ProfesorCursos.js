import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../styles/GestionCursosProfesor.css';
import '../../styles/EditarUsuarios.css';
import API_URL from '../../Server';

const ProfesorCursos = () => {
    const [profesores, setProfesores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [cara, setCara] = useState('mas');
    const profesoresPorPagina = 20;
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProfesores = async () => {
            try {
                const endpoint = cara === 'mas' ? '/cursos/profesores/mas' : '/cursos/profesores/menos';
                const response = await fetch(`${API_URL}/api/metricas${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud.');
                }
                const data = await response.json();
                setProfesores(data);
            } catch (error) {
                console.error('Error al obtener los profesores:', error.message);
            }
        };

        fetchProfesores();
    }, [cara]);

    const handleGoBack = () => {
        navigate(-1); 
    };

    // Calcular los profesores a mostrar en la página actual
    const indexOfLastProfesor = currentPage * profesoresPorPagina;
    const indexOfFirstProfesor = indexOfLastProfesor - profesoresPorPagina;
    const currentProfesores = profesores.slice(indexOfFirstProfesor, indexOfLastProfesor);

    // Cambiar de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Calcular el número total de páginas
    const totalPages = Math.ceil(profesores.length / profesoresPorPagina);

    // Cambiar entre "más cursos" y "menos cursos"
    const toggleCara = () => {
        setCara((prevCara) => (prevCara === 'mas' ? 'menos' : 'mas'));
        setCurrentPage(1); 
    };

    return (
        <div className="ver-proyectos-curso-container">
            <div className="gestion-cursos-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center my-4">
                    {cara === 'mas' ? 'Profesores con más cursos' : 'Profesores con menos cursos'}
                </h1>
                <div className="toggle-button-container text-center mb-4">
                    <button className="toggle-button" onClick={toggleCara}>
                        {cara === 'mas' ? 'Mostrar Profesores con Menos Cursos' : 'Mostrar Profesores con Más Cursos'}
                    </button>
                </div>
                {profesores.length > 0 ? (
                    <>
                        <Table responsive bordered hover className="gestion-cursos-table mt-4">
                            <thead>
                                <tr>
                                    <th className="text-center">Nombre</th>
                                    <th className="text-center">Correo Electrónico</th>
                                    <th className="text-center">Cantidad de Cursos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProfesores.map((profesor) => (
                                    <tr key={profesor.id}>
                                        <td className="text-center">{profesor.nombre}</td>
                                        <td className="text-center">{profesor.correo_institucional}</td>
                                        <td className="text-center">{profesor.cantidad_cursos}</td>
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
                    <p className="text-center">Cargando detalles de los profesores...</p>
                )}
            </div>
        </div>
    );
};

export default ProfesorCursos;
