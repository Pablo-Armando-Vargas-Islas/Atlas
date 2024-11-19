import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import BotonDescargaAdmin from "../../utils/BotonDescargaAdmin";
import { FaList, FaCheck, FaTimes, FaEdit, FaArrowLeft } from 'react-icons/fa';
import "../../styles/ProyectosPorCurso.css";
import API_URL from '../../Server';

const ProyectosPorCurso = () => {
    const { id: cursoId } = useParams();
    const [proyectos, setProyectos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (cursoId) {
            fetchProyectos();
        }
    }, [cursoId]);

    const handleGoBack = () => {
        navigate(-1); 
    };

    const fetchProyectos = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/admin/cursos/proyectos/${cursoId}`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                setProyectos(data);
            } else {
                const errorText = await response.text();
                console.error("Error al obtener los proyectos del curso:", errorText);
            }
        } catch (error) {
            console.error("Error al obtener los proyectos del curso:", error);
        }
    };
    
    const handleToggleExpand = (index) => {
        if (expandedRows.includes(index)) {
            setExpandedRows(expandedRows.filter((i) => i !== index));
        } else {
            setExpandedRows([...expandedRows, index]);
        }
    };
    
    const handleVerDetalles = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    const [editIndex, setEditIndex] = useState(null);
    const [editingProyecto, setEditingProyecto] = useState({
        titulo: "",
        descripcion: "",
        necesita_licencia: false,
        descripcion_licencia: "",
        ruta_archivo_comprimido: ""
    });

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditingProyecto(proyectos[index]);
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
    
        setEditingProyecto((prevProyecto) => {
            if (name === "necesita_licencia" && !checked) {
                return {
                    ...prevProyecto,
                    [name]: checked,
                    descripcion_licencia: ""
                };
            }
    
            return {
                ...prevProyecto,
                [name]: type === "checkbox" ? checked : value
            };
        });
    };
    
    const handleSave = async () => {
        if (editingProyecto.necesita_licencia && !editingProyecto.descripcion_licencia) {
            alert("Debe proporcionar una descripción de la licencia si el proyecto necesita una.");
            return;
        }
    
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/admin/proyectos/${editingProyecto.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editingProyecto)
            });
    
            if (response.ok) {
                const updatedProyecto = await response.json();
                setProyectos((prevProyectos) =>
                    prevProyectos.map((proyecto, index) =>
                        index === editIndex ? updatedProyecto : proyecto
                    )
                );
                setEditIndex(null);
            } else {
                console.error("Error al actualizar el proyecto:", await response.text());
            }
        } catch (error) {
            console.error("Error al actualizar el proyecto:", error);
        }
    };    
    
    const handleCancelEdit = () => { 
        setEditIndex(null);
        setEditingProyecto({
            titulo: "",
            descripcion: "",
            necesita_licencia: false,
            descripcion_licencia: "",
            ruta_archivo_comprimido: ""
        });
    };
    

    return (
        <div className="proyectos-curso-container">
            <div className="box-container">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="titulo-proyectos-curso">Proyectos del Curso</h1>
                <table className="tabla-proyectos">
                <thead>
                    <tr>
                        <th>Proyecto</th>
                        <th>Descripción</th>
                        <th>Licencia</th>
                        <th>Descripción</th>
                        <th>Archivo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                        {proyectos.map((proyecto, index) => (
                            <tr key={proyecto.id}>
                                {editIndex === index ? (
                                    <>
                                        <td>
                                            <input
                                                type="text"
                                                name="titulo"
                                                value={editingProyecto.titulo}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="descripcion"
                                                value={editingProyecto.descripcion}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                name="necesita_licencia"
                                                checked={editingProyecto.necesita_licencia}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="descripcion_licencia"
                                                value={editingProyecto.descripcion_licencia}
                                                onChange={handleInputChange}
                                                disabled={!editingProyecto.necesita_licencia}
                                            />
                                        </td>
                                        <td>
                                            {editingProyecto.ruta_archivo_comprimido
                                                ? editingProyecto.ruta_archivo_comprimido.split("\\").pop()
                                                : "No se ha subido ningún archivo"}
                                        </td>
                                        <td>
                                            <FaCheck
                                                onClick={handleSave}
                                                className="icono-accion-listo"
                                                title="Guardar cambios"
                                                style={{ cursor: "pointer", marginRight: "10px" }}
                                            />
                                            <FaTimes
                                                onClick={handleCancelEdit}
                                                className="icono-accion-cancelar"
                                                title="Cancelar edición"
                                                style={{ cursor: "pointer" }}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{proyecto.titulo}</td>
                                        <td>
                                            {expandedRows.includes(index)
                                                ? proyecto.descripcion
                                                : proyecto.descripcion.length > 50
                                                    ? `${proyecto.descripcion.substring(0, 50)}...`
                                                    : proyecto.descripcion}
                                            {proyecto.descripcion.length > 50 && (
                                                <button
                                                    className="boton-ver-mas"
                                                    onClick={() => handleToggleExpand(index)}
                                                >
                                                    {expandedRows.includes(index) ? "Ver menos" : "Ver más"}
                                                </button>
                                            )}
                                        </td>
                                        <td>{proyecto.necesita_licencia ? "Sí" : "No"}</td>
                                        <td>
                                            {expandedRows.includes(index)
                                                ? proyecto.descripcion_licencia
                                                : proyecto.descripcion_licencia.length > 50
                                                    ? `${proyecto.descripcion_licencia.substring(0, 50)}...`
                                                    : proyecto.descripcion_licencia}
                                            {proyecto.descripcion_licencia.length > 50 && (
                                                <button
                                                    className="boton-ver-mas"
                                                    onClick={() => handleToggleExpand(index)}
                                                >
                                                    {expandedRows.includes(index) ? "Ver menos" : "Ver más"}
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            {proyecto.ruta_archivo_comprimido
                                                ? proyecto.ruta_archivo_comprimido.split("\\").pop()
                                                : "No se ha subido ningún archivo"}
                                        </td>
                                        <td>
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Ver detalles</Tooltip>}>
                                                <Button
                                                    variant="link"
                                                    className="p-0 ver-proyectos-admin-btn align-middle" 
                                                    onClick={() => handleVerDetalles(proyecto)}
                                                >
                                                    <FaList />
                                                </Button>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Editar Proyecto</Tooltip>}>
                                                <Button
                                                    variant="link"
                                                    className="p-0 cerrar-curso-btn align-middle"
                                                    onClick={() => navigate(`/admin/editar-proyecto/${proyecto.id}`)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                            </OverlayTrigger>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
    
                {/* Modal para mostrar detalles del proyecto */}
                <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Detalles del Proyecto</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {proyectoSeleccionado && (
                            <>
                                <p><strong>Título:</strong> {proyectoSeleccionado.titulo}</p>
                                <p><strong>Descripción:</strong> {proyectoSeleccionado.descripcion}</p>
                                <p><strong>¿Necesita licencia?:</strong> {proyectoSeleccionado.necesita_licencia ? "Sí" : "No"}</p>
                                {proyectoSeleccionado.necesita_licencia && (
                                    <p><strong>Descripción de la licencia:</strong> {proyectoSeleccionado.descripcion_licencia}</p>
                                )}
                                <p><strong>Archivo Comprimido:</strong> {proyectoSeleccionado.ruta_archivo_comprimido ? proyectoSeleccionado.ruta_archivo_comprimido : "No se ha subido ningún archivo"}</p>
                                <p><strong>Tipo de Proyecto:</strong> {proyectoSeleccionado.tipo}</p>
                                <p><strong>Autores:</strong> {proyectoSeleccionado.autores ? proyectoSeleccionado.autores.join(", ") : "N/A"}</p>
                                <p><strong>Tecnologías:</strong> {proyectoSeleccionado.tecnologias ? proyectoSeleccionado.tecnologias.join(", ") : "N/A"}</p>
                                <p><strong>Categorías:</strong> {proyectoSeleccionado.categorias ? proyectoSeleccionado.categorias.join(", ") : "N/A"}</p>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cerrar
                        </Button>
                        {/* Botón de descarga */}
                        {proyectoSeleccionado && proyectoSeleccionado.ruta_archivo_comprimido && (
                            <BotonDescargaAdmin id={proyectoSeleccionado.id} />
                        )}
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default ProyectosPorCurso;
