import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/EditarUsuarios.css';  // Usamos los mismos estilos
import { FaEdit, FaCheck, FaTimes, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';

const GestionCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState("");
    const [nombreEditar, setNombreEditar] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener Categorías desde la base de datos
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('token'); // Obtener el token almacenado
            const response = await fetch('http://localhost:5000/api/admin/categorias', {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pasar el token en el encabezado
                },
            });
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
        }
    };
    
    const handleAdd = async () => {
        if (nuevaCategoria.trim()) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/add/categorias', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Pasar el token en el encabezado
                    },
                    body: JSON.stringify({ nombre: nuevaCategoria }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    setCategorias([...categorias, data]);
                    setNuevaCategoria("");  // Limpiar el campo de texto
                    setError("");  // Limpiar cualquier error previo
                } else {
                    setError(data.error);  // Guardar el error en el estado
                }
    
            } catch (error) {
                console.error("Error al añadir categoría:", error);
                setError("Hubo un problema al intentar añadir la categoría. Inténtalo de nuevo.");
            }
        }
    };
    
    const handleSave = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/edit/categorias/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Pasar el token en el encabezado
                },
                body: JSON.stringify({ nombre: nombreEditar }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                // Si la respuesta no es exitosa, mostramos el error
                alert(data.error);  // Mostrar el mensaje de error de la respuesta del servidor
                return;
            }
    
            // Si la actualización fue exitosa, actualizamos el estado
            setCategorias(categorias.map(cat => cat.id === id ? data : cat));
            setEditIndex(null);
    
        } catch (error) {
            console.error("Error al editar categoría:", error);
            alert("Hubo un problema al intentar editar la categoría. Inténtalo de nuevo.");
        }
    };
    
    
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/delete/categorias/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                // Si hay un error en la respuesta, mostramos la alerta con el mensaje de error
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Error al eliminar la categoría');
                }
                return;
            }
    
            // Actualizar el estado solo si la eliminación fue exitosa
            setCategorias(categorias.filter(cat => cat.id !== id));
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            alert("Hubo un problema al intentar eliminar la categoría. Inténtalo de nuevo.");
        }
    };
    
    const handleEdit = (id) => {
        setEditIndex(id); // Guardamos el ID de la categoría que está siendo editada
        const categoria = categorias.find(cat => cat.id === id); // Buscamos la categoría por ID
        setNombreEditar(categoria.nombre); // Ponemos el nombre de la categoría en el estado para editarlo
    };    

    return (
        <div className="admin-usuarios-container">
            <div className="box-container">
                <div className="navegar-atras" onClick={() => navigate(-1)}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="titulo-gestion-usuarios">Gestión de Categorías</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="buscador-y-boton mt-4">
                    <input
                        type="text"
                        placeholder="Ingresa la nueva categoría"
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        className="buscador-usuarios"
                    />
                    <OverlayTrigger placement="top" overlay={<Tooltip>Añadir</Tooltip>}>
                        <button className="boton-crear-curso" onClick={handleAdd}>
                            <FaPlus />
                        </button>
                    </OverlayTrigger>
                </div>
                <table className="tabla-usuarios">
                    <thead>
                        <tr>
                            <th>Nombre de la Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    {editIndex === cat.id ? (
                                        <input
                                            type="text"
                                            value={nombreEditar}
                                            onChange={(e) => setNombreEditar(e.target.value)}
                                        />
                                    ) : (
                                        cat.nombre
                                    )}
                                </td>
                                <td>
                                    {editIndex === cat.id ? (
                                        <>
                                            <FaCheck
                                                onClick={() => handleSave(cat.id)}
                                                className="icono-accion-listo"
                                                title="Guardar cambios"
                                            />
                                            <FaTimes
                                                onClick={() => setEditIndex(null)}
                                                className="icono-accion-cancelar"
                                                title="Cancelar edición"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Editar</Tooltip>}>
                                                <span>
                                                    <FaEdit
                                                        onClick={() => {
                                                            setEditIndex(cat.id);
                                                            setNombreEditar(cat.nombre);
                                                        }}
                                                        className="icono-accion-editar"
                                                    />
                                                </span>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar</Tooltip>}>
                                                <span>
                                                    <FaTrash
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="icono-accion-eliminar"
                                                    />
                                                </span>
                                            </OverlayTrigger>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );    
};

export default GestionCategorias;