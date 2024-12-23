import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/EditarUsuarios.css';  
import { FaEdit, FaCheck, FaTimes, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import API_URL from '../../Server';

const GestionTecnologias = () => {
    const [tecnologias, setTecnologias] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [nuevaTecnologia, setNuevaTecnologia] = useState("");
    const [nombreEditar, setNombreEditar] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTecnologias();
    }, []);

    const fetchTecnologias = async () => {
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch(`${API_URL}/api/admin/tecnologias`, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });
            const data = await response.json();
            setTecnologias(data);
        } catch (error) {
            console.error("Error al obtener tecnologías:", error);
        }
    };
    
    const handleAdd = async () => {
        if (nuevaTecnologia.trim()) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/admin/add/tecnologias`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, 
                    },
                    body: JSON.stringify({ nombre: nuevaTecnologia }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    setTecnologias([...tecnologias, data]);
                    setNuevaTecnologia("");  
                    setError(""); 
                } else {
                    setError(data.error); 
                }
    
            } catch (error) {
                console.error("Error al añadir tecnología:", error);
                setError("Hubo un problema al intentar añadir la tecnología. Inténtalo de nuevo.");
            }
        }
    };
    
    const handleSave = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/edit/tecnologias/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ nombre: nombreEditar }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                alert(data.error); 
                return;
            }
    
            setTecnologias(tecnologias.map(tec => tec.id === id ? data : tec));
            setEditIndex(null);
    
        } catch (error) {
            console.error("Error al editar tecnología:", error);
            alert("Hubo un problema al intentar editar la tecnología. Inténtalo de nuevo.");
        }
    };
    
    
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/delete/tecnologias/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Error al eliminar la tecnología');
                }
                return;
            }
    
            setTecnologias(tecnologias.filter(tec => tec.id !== id));
        } catch (error) {
            console.error("Error al eliminar tecnología:", error);
            alert("Hubo un problema al intentar eliminar la tecnología. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="admin-usuarios-container">
            <div className="box-container">
                <div className="navegar-atras" onClick={() => navigate(-1)}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="titulo-gestion-usuarios">Gestión de Tecnologías</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="buscador-y-boton mt-4">
                    <input
                        type="text"
                        placeholder="Ingresa la nueva tecnología"
                        value={nuevaTecnologia}
                        onChange={(e) => setNuevaTecnologia(e.target.value)}
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
                            <th>Nombre de la Tecnología</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tecnologias.map(tec => (
                            <tr key={tec.id}>
                                <td>
                                    {editIndex === tec.id ? (
                                        <input
                                            type="text"
                                            value={nombreEditar}
                                            onChange={(e) => setNombreEditar(e.target.value)}
                                        />
                                    ) : (
                                        tec.nombre
                                    )}
                                </td>
                                <td>
                                    {editIndex === tec.id ? (
                                        <>
                                            <FaCheck
                                                onClick={() => handleSave(tec.id)}
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
                                                            setEditIndex(tec.id);
                                                            setNombreEditar(tec.nombre);
                                                        }}
                                                        className="icono-accion-editar"
                                                    />
                                                </span>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar</Tooltip>}>
                                                <span>
                                                    <FaTrash
                                                        onClick={() => handleDelete(tec.id)}
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

export default GestionTecnologias;