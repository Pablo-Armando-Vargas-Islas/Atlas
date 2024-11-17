import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaUserCheck } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../../styles/EditarUsuarios.css';

const API_URL = 'http://localhost:5000';

const UsuariosInactivos = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState(""); 
    const navigate = useNavigate();
    const usuariosPorPagina = 15;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchUsuariosInactivos();
    }, []);

    const fetchUsuariosInactivos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/metricas/usuarios/inactivos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los usuarios inactivos.');
            }
            const data = await response.json();
            setUsuarios(data);
        } catch (error) {
            console.error('Error al obtener usuarios inactivos:', error.message);
        }
    };

    const handleGoBack = () => {
        navigate(-1); 
    };

    const handleSearchChange = (e) => {
        setBusqueda(e.target.value);
        setCurrentPage(1); 
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Filtrar usuarios según la búsqueda
    const filteredUsuarios = usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.correo_institucional.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.nombre_rol.toLowerCase().includes(busqueda.toLowerCase()) ||
        (usuario.cedula || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (usuario.codigo_estudiante || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    const indexOfLastUser = currentPage * usuariosPorPagina;
    const indexOfFirstUser = indexOfLastUser - usuariosPorPagina;
    const currentUsuarios = filteredUsuarios.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(filteredUsuarios.length / usuariosPorPagina);

    const highlightMatch = (text) => {
        if (!busqueda) return text;
        const regex = new RegExp(`(${busqueda})`, 'gi');
        return text.split(regex).map((part, index) =>
            part.toLowerCase() === busqueda.toLowerCase() ? (
                <span key={index} className="resaltado-busqueda">{part}</span>
            ) : (
                part
            )
        );
    };

    const handleActivateUser = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/api/metricas/usuarios/${userId}/activar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                alert('Usuario activado correctamente');
                fetchUsuariosInactivos(); 
            } else {
                const data = await response.json();
                console.error('Error al activar el usuario:', data.error);
                alert('Error al activar el usuario');
            }
        } catch (error) {
            console.error('Error al activar el usuario:', error);
            alert('Error al activar el usuario');
        }
    };

    return (
        <div className="admin-usuarios-container">
            <div className="box-container">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="titulo-gestion-usuarios">Usuarios Inactivos</h1>
                <div className="buscador-y-boton">
                    <input
                        type="text"
                        placeholder="Buscar usuario"
                        value={busqueda}
                        onChange={handleSearchChange}
                        className="buscador-usuarios"
                    />
                </div>
                {usuarios.length > 0 ? (
                    <>
                        <table className="tabla-usuarios">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Usuario (Cédula/Código)</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{highlightMatch(usuario.nombre)}</td>
                                        <td>{highlightMatch(usuario.correo_institucional)}</td>
                                        <td>{highlightMatch(usuario.nombre_rol)}</td> 
                                        <td>{highlightMatch(usuario.cedula || usuario.codigo_estudiante)}</td>
                                        <td>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>Activar usuario</Tooltip>}
                                            >
                                                <span>
                                                    <FaUserCheck
                                                        onClick={() => handleActivateUser(usuario.id)}
                                                        className="icono-accion-activar"
                                                        style={{ cursor: 'pointer', color: 'green' }}
                                                    />
                                                </span>
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                    <p className="text-center">Cargando detalles de los usuarios inactivos...</p>
                )}
            </div>
        </div>
    );
};

export default UsuariosInactivos;
