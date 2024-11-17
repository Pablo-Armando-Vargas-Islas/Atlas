import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/EditarCursos.css";
import { FaEdit, FaCheck, FaTimes, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const API_URL = 'http://localhost:5000';

const EditarCursos = () => {
    const [cursos, setCursos] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editingCurso, setEditingCurso] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const navigate = useNavigate();

    useEffect(() => {
        fetchCursos();
        fetchProfesores();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/cursos`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) {
                const cursosFormateados = data.map(curso => ({
                    ...curso,
                    fecha_inicio: curso.fecha_inicio ? curso.fecha_inicio.split('T')[0] : "",
                    fecha_fin: curso.fecha_fin ? curso.fecha_fin.split('T')[0] : ""
                }));
                setCursos(cursosFormateados);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error("Error al obtener los cursos:", error);
        }
    };

    const fetchProfesores = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/usuariosRol?roles=2`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProfesores(data);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error("Error al obtener los profesores y administradores:", error);
        }
    };

    const handleSearchChange = (e) => {
        setBusqueda(e.target.value.toLowerCase());
    };

    const handleGoBack = () => {
        navigate(-1); 
    };

    const handleEdit = (index) => {
        const curso = { ...cursos[index] };
        setEditingCurso({
            id: curso.id,
            nombre_curso: curso.nombre_curso || "",
            profesor_id: curso.profesor_id || "", 
            periodo: curso.periodo || "",
            fecha_inicio: curso.fecha_inicio || "",
            fecha_fin: curso.fecha_fin || "",
            codigo_curso: curso.codigo_curso || "",
            estado: curso.estado || "abierto"
        });
        setEditIndex(index);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "estado" && value === "abierto") {
            // Si se cambia a "abierto", limpiar la fecha de cierre y obligar a seleccionar una nueva fecha
            setEditingCurso((prev) => ({
                ...prev,
                [name]: value,
                fecha_fin: ""  
            }));
        } else {
            setEditingCurso((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    

    const handleSave = async () => {
        const hoy = new Date().toISOString().split("T")[0]; 
        
        // Validar que ningún campo sea nulo
        if (!editingCurso.nombre_curso || !editingCurso.profesor_id || !editingCurso.periodo || !editingCurso.fecha_inicio || !editingCurso.fecha_fin || !editingCurso.codigo_curso) {
            alert("Todos los campos son obligatorios. Por favor, complete todos los campos antes de guardar.");
            return;
        }
        // Validar que si el curso se abre, tenga una fecha de cierre válida
        if (editingCurso.estado === "abierto" && (!editingCurso.fecha_fin || editingCurso.fecha_fin < hoy)) {
            alert("Debe seleccionar una nueva fecha de cierre.");
            return;
        }
    
        // Actualizar la fecha de cierre si el curso se cierra antes de la fecha establecida
        if (editingCurso.estado === "cerrado" && editingCurso.fecha_fin && editingCurso.fecha_fin > hoy) {
            editingCurso.fecha_fin = hoy; 
        }
    
        try {
            const updatedCurso = {
                id: editingCurso.id,
                nombre_curso: editingCurso.nombre_curso,
                profesor_id: editingCurso.profesor_id === "" ? null : editingCurso.profesor_id,
                periodo: editingCurso.periodo,
                fecha_inicio: editingCurso.fecha_inicio || null,
                fecha_fin: editingCurso.fecha_fin || null,
                codigo_curso: editingCurso.codigo_curso,
                estado: editingCurso.estado
            };
    
            const response = await fetch(`${API_URL}/api/admin/cursos/${editingCurso.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(updatedCurso)
            });
    
            if (response.ok) {
                setEditIndex(null);
                fetchCursos(); 
            } else {
                const data = await response.json();
                console.error("Error al actualizar el curso:", data.error);
            }
        } catch (error) {
            console.error("Error al actualizar el curso:", error);
        }
    };    

    const handleCancelEdit = () => {
        setEditIndex(null);
    };

    const resaltarCoincidencias = (texto) => {
        if (!busqueda) return texto;

        const partes = texto.split(new RegExp(`(${busqueda})`, 'gi'));
        return partes.map((parte, i) =>
            parte.toLowerCase() === busqueda ? <span key={i} className="highlight">{parte}</span> : parte
        );
    };

    const capitalize = (text) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCursos = cursos.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(cursos.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPagination = () => (
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
    ); 

    return (
        <div className="admin-cursos-container">
            <div className="box-container">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="titulo-gestion-cursos">Gestión de Cursos</h1>
                <div className="buscador-y-boton">
                    <input
                        type="text"
                        placeholder="Buscar curso"
                        value={busqueda}
                        onChange={handleSearchChange}
                        className="buscador-cursos"
                    />
                    <OverlayTrigger
                        placement="top" 
                        overlay={<Tooltip>Crear nuevo curso</Tooltip>}
                    >
                        <button
                            className="boton-crear-curso"
                            onClick={() => navigate("/admin/crear-curso")}
                        >
                            <FaPlus />
                        </button>
                    </OverlayTrigger>
                </div>
                <table className="tabla-cursos">
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Profesor</th>
                            <th>Periodo</th>
                            <th>Inicio</th>
                            <th>Cierre</th>
                            <th>Código</th>
                            <th>Estado</th>
                            <th>Proyectos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCursos
                            .filter(curso => {
                                return (
                                    curso.nombre_curso.toLowerCase().includes(busqueda) ||
                                    curso.nombre_profesor.toLowerCase().includes(busqueda) ||
                                    curso.periodo.toLowerCase().includes(busqueda) ||
                                    curso.fecha_inicio.includes(busqueda) ||
                                    curso.fecha_fin.includes(busqueda) ||
                                    curso.codigo_curso.toLowerCase().includes(busqueda) ||
                                    curso.estado.toLowerCase().includes(busqueda) ||
                                    curso.cantidad_proyectos.toString().includes(busqueda)
                                );
                            })
                            .map((curso, index) => (
                                <tr key={curso.id}>
                                    {editIndex === index ? (
                                        <>
                                            <td>
                                                <input type="text" name="nombre_curso" value={editingCurso.nombre_curso} onChange={handleInputChange} />
                                            </td>
                                            <td>
                                                <select
                                                    name="profesor_id"
                                                    value={editingCurso.profesor_id}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Seleccione un profesor</option>
                                                    {profesores.map(profesor => (
                                                        <option key={profesor.id} value={profesor.id}>
                                                            {profesor.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="text" name="periodo" value={editingCurso.periodo} onChange={handleInputChange} />
                                            </td>
                                            <td>{resaltarCoincidencias(curso.fecha_inicio)}</td>
                                            <td>
                                                <input
                                                    type="date"
                                                    name="fecha_fin"
                                                    value={editingCurso.fecha_fin}
                                                    min={new Date().toISOString().split("T")[0]} 
                                                    onChange={handleInputChange}
                                                />
                                            </td>
                                            <td>{resaltarCoincidencias(curso.codigo_curso)}</td>
                                            <td>
                                                <select name="estado" value={editingCurso.estado} onChange={handleInputChange}>
                                                    <option value="abierto">Abierto</option>
                                                    <option value="cerrado">Cerrado</option>
                                                </select>
                                            </td>
                                            <td>{curso.cantidad_proyectos}</td>
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
                                            <td>{resaltarCoincidencias(curso.nombre_curso)}</td>
                                            <td>{resaltarCoincidencias(curso.nombre_profesor)}</td>
                                            <td>{resaltarCoincidencias(curso.periodo)}</td>
                                            <td>{resaltarCoincidencias(curso.fecha_inicio)}</td>
                                            <td>{resaltarCoincidencias(curso.fecha_fin)}</td>
                                            <td>{resaltarCoincidencias(curso.codigo_curso)}</td>
                                            <td>{resaltarCoincidencias(capitalize(curso.estado))}</td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top" 
                                                    overlay={<Tooltip>Ver proyectos</Tooltip>} 
                                                >
                                                    <a href={`/proyectos-curso/${curso.id}`} className="link-proyectos">
                                                        {resaltarCoincidencias(curso.cantidad_proyectos.toString())}
                                                    </a>
                                                </OverlayTrigger>
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top" 
                                                    overlay={<Tooltip>Editar curso</Tooltip>} 
                                                >
                                                    <span>
                                                        <FaEdit
                                                            onClick={() => handleEdit(index)}
                                                            className="icono-accion-editar-curso"
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </span>
                                                </OverlayTrigger>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </table>
                {renderPagination()}
            </div>
        </div>
    );
};

export default EditarCursos;
