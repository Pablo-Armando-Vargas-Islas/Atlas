import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/EditarUsuarios.css";
import { FaEdit, FaCheck, FaTimes, FaUserSlash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const API_URL = 'http://localhost:5000';

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editingUser, setEditingUser] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const usuariosPorPagina = 15;
    const navigate = useNavigate();

    useEffect(() => { 
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/usuarios`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUsuarios(data);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
        }
    };

    const handleGoBack = () => {
        navigate(-1); 
    };

    const handleSearchChange = (e) => {
        setBusqueda(e.target.value);
        setCurrentPage(1); 
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setEditingUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleRoleChange = (e) => {
        const newRoleId = parseInt(e.target.value, 10);

        setEditingUser((prevUser) => {
            let updatedUser = { ...prevUser, rol_id: newRoleId };

            if (prevUser.rol_id !== newRoleId) {
                if (newRoleId === 3) {
                    // Cambió a Alumno - mover cédula a código de estudiante
                    updatedUser.codigo_estudiante = prevUser.cedula || "";
                    updatedUser.cedula = "";
                } else if (newRoleId === 1 || newRoleId === 2) {
                    // Cambió a Administrador o Docente - mover código de estudiante a cédula
                    updatedUser.cedula = prevUser.codigo_estudiante || "";
                    updatedUser.codigo_estudiante = "";
                }
            }

            return updatedUser;
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/usuarios/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(editingUser)
            });

            if (response.ok) {
                setEditIndex(null);
                fetchUsuarios();
            } else {
                const data = await response.json();
                console.error("Error al actualizar el usuario:", data.error);
            }
        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setEditingUser({});
    };

    const handleEdit = (index) => {
        setEditIndex(index);
    
        const selectedUser = { ...usuarios[index] };
        
        if (selectedUser.rol_id === 3) {
            selectedUser.codigo_estudiante = selectedUser.codigo_estudiante || "";
            selectedUser.cedula = ""; 
        } else if (selectedUser.rol_id === 1 || selectedUser.rol_id === 2) {
            selectedUser.cedula = selectedUser.cedula || "";
            selectedUser.codigo_estudiante = ""; 
        }
    
        setEditingUser(selectedUser);
    };
    

    const handleInactivate = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/usuarios/${userId}/inactivar`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                alert("Se dió de baja al usuario correctamente");
                fetchUsuarios();
            } else {
                const data = await response.json();
                console.error("Error al inactivar el usuario:", data.error);
                alert("Error al inactivar el usuario");
            }
        } catch (error) {
            console.error("Error al inactivar el usuario:", error);
            alert("Error al inactivar el usuario");
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const highlightText = (text) => {
        if (!busqueda) return text;
        const regex = new RegExp(`(${busqueda})`, "gi");
        return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    };

    // Filtrar usuarios según su búsqueda
    const filteredUsuarios = usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.correo_institucional.toLowerCase().includes(busqueda.toLowerCase()) ||
        (usuario.cedula || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (usuario.codigo_estudiante || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.nombre_rol.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Calcular los usuarios a mostrar en la página actual
    const indexOfLastUser = currentPage * usuariosPorPagina;
    const indexOfFirstUser = indexOfLastUser - usuariosPorPagina;
    const currentUsuarios = filteredUsuarios.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(filteredUsuarios.length / usuariosPorPagina);

    return (
        <div className="admin-usuarios-container">
            <div className="box-container">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="titulo-gestion-usuarios">Gestión de Usuarios</h1>
                <div className="buscador-y-boton">
                    <input
                        type="text"
                        placeholder="Buscar usuario"
                        value={busqueda}
                        onChange={handleSearchChange}
                        className="buscador-usuarios"
                    />
                    <OverlayTrigger
                        placement="top" 
                        overlay={<Tooltip>Registrar nuevo usuario</Tooltip>}
                    >
                        <button
                            className="boton-crear-curso"
                            onClick={() => navigate("/registrar-admin")}
                        >
                            <FaPlus />
                        </button>
                    </OverlayTrigger>
                </div>
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
                        {currentUsuarios.map((usuario, index) => {
                            return (
                                <tr key={usuario.id} className={usuario.status_usuario === 'inactivo' ? 'fila-inactiva' : ''}>
                                    {editIndex === index + indexOfFirstUser ? (
                                        <>
                                            <td><input type="text" name="nombre" value={editingUser.nombre || ""} onChange={handleInputChange} /></td>
                                            <td><input type="text" name="correo_institucional" value={editingUser.correo_institucional || ""} onChange={handleInputChange} /></td>
                                            <td>
                                                <select
                                                    name="rol_id"
                                                    value={editingUser.rol_id || ""}
                                                    onChange={handleRoleChange}
                                                >
                                                    <option value="1">Administrador</option>
                                                    <option value="2">Docente</option>
                                                    <option value="3">Alumno</option>
                                                </select>
                                            </td>
                                            <td>
                                                {(editingUser.rol_id === 1 || editingUser.rol_id === 2) && (
                                                    <input
                                                        type="text"
                                                        name="cedula"
                                                        value={editingUser.cedula || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                )}
                                                {editingUser.rol_id === 3 && (
                                                    <input
                                                        type="text"
                                                        name="codigo_estudiante"
                                                        value={editingUser.codigo_estudiante || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                <FaCheck
                                                    onClick={handleSave}
                                                    className="icono-accion-listo"
                                                    title="Guardar cambios"
                                                />
                                                <FaTimes
                                                    onClick={handleCancelEdit}
                                                    className="icono-accion-cancelar"
                                                    title="Cancelar edición"
                                                />
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.nombre) }}></td>
                                            <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.correo_institucional) }}></td>
                                            <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.nombre_rol) }}></td>
                                            <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.cedula || usuario.codigo_estudiante) }}></td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top" 
                                                    overlay={<Tooltip>Editar usuario</Tooltip>}
                                                >
                                                    <span>
                                                        <FaEdit
                                                            onClick={() => handleEdit(index + indexOfFirstUser)}
                                                            className="icono-accion-editar"
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </span>
                                                </OverlayTrigger>
                                                
                                                <OverlayTrigger
                                                    placement="top" 
                                                    overlay={<Tooltip>{usuario.status_usuario !== 'inactivo' ? 'Baja de usuario' : 'Usuario inactivo'}</Tooltip>}
                                                >
                                                    <span>
                                                        <FaUserSlash
                                                            onClick={usuario.status_usuario !== 'inactivo' ? () => handleInactivate(usuario.id) : null}
                                                            className={`icono-accion-inactivar ${usuario.status_usuario === 'inactivo' ? 'icono-desactivado' : ''}`}
                                                            style={{ cursor: usuario.status_usuario === 'inactivo' ? 'not-allowed' : 'pointer' }}
                                                        />
                                                    </span>
                                                </OverlayTrigger>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
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
            </div>
        </div>
    );
};

export default AdminUsuarios;
