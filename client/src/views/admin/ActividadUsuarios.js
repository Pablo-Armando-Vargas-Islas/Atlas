import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../styles/GestionCursosProfesor.css';
import '../../styles/EditarUsuarios.css';

const API_URL = 'http://localhost:5000';

const ActividadUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usuariosPorPagina = 20;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/metricas/usuarios/activos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Error al obtener los usuarios activos.');
                }
                const data = await response.json();
                setUsuarios(data);
            } catch (error) {
                console.error('Error al obtener los usuarios activos:', error.message);
            }
        };

        fetchUsuarios();
    }, []);

    const handleGoBack = () => {
        navigate(-1); 
    };

    // Calcular los usuarios a mostrar en la página actual
    const indexOfLastUser = currentPage * usuariosPorPagina;
    const indexOfFirstUser = indexOfLastUser - usuariosPorPagina;
    const currentUsuarios = usuarios.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(usuarios.length / usuariosPorPagina);

    return (
        <div className="ver-proyectos-curso-container">
            <div className="gestion-cursos-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center my-4">Usuarios activos en la última semana</h1>
                {usuarios.length > 0 ? (
                    <>
                        <Table responsive bordered hover className="gestion-cursos-table mt-4">
                            <thead>
                                <tr>
                                    <th className="text-center">Rol</th>
                                    <th className="text-center">Nombre</th>
                                    <th className="text-center">Correo Electrónico</th>
                                    <th className="text-center">Usuario (Cédula o Código de Estudiante)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td className="text-center">{usuario.nombre_rol}</td>
                                        <td className="text-center">{usuario.nombre}</td>
                                        <td className="text-center">{usuario.email}</td>
                                        <td className="text-center">{usuario.cedula || usuario.codigo_estudiante}</td>
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
                    <p className="text-center">Cargando detalles de los usuarios activos...</p>
                )}
            </div>
        </div>
    );
};

export default ActividadUsuarios;
