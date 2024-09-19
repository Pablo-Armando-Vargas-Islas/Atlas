import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Modal, Button } from "react-bootstrap";
import Sidebar from "../Sidebar";
import "../styles/SubirProyectoProfesor.css";

const SubirProyectoProfesor = () => {
    const [userId, setUserId] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [necesitaLicencia, setNecesitaLicencia] = useState(false);
    const [descripcionLicencia, setDescripcionLicencia] = useState("");
    const [linkGithub, setLinkGithub] = useState("");
    const [archivoComprimido, setArchivoComprimido] = useState(null);
    const [tipo, setTipo] = useState(""); // Valor inicial vacío
    const [codigoCurso, setCodigoCurso] = useState(""); // Código del curso
    const [cursoValido, setCursoValido] = useState(false); // Para saber si el curso es válido
    const [cursoNombre, setCursoNombre] = useState(""); // Nombre del curso validado
    const [autores, setAutores] = useState([""]);
    const [tecnologias, setTecnologias] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedTecnologias, setSelectedTecnologias] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [missingFields, setMissingFields] = useState([]);
    const navigate = useNavigate();

    // Recuperar el token del localStorage y decodificarlo
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id); // Establecer el userId decodificado desde el token
                console.log("User ID decodificado:", decodedToken.id);
            } catch (error) {
                console.error("Error al decodificar el token:", error);
            }
        }
    }, []);

    // Fetch para obtener las tecnologías y categorías
    useEffect(() => {
        const fetchTecnologias = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/proyectos/tecnologias");
                const data = await response.json();
                setTecnologias(data); // Guardar las tecnologías en el estado
            } catch (error) {
                console.error("Error al obtener las tecnologías:", error);
            }
        };

        const fetchCategorias = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/proyectos/categorias");
                const data = await response.json();
                setCategorias(data); // Guardar las categorías en el estado
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
            }
        };

        fetchTecnologias();
        fetchCategorias();
    }, []);

    const validateFields = () => {
        const missing = [];
        if (!titulo) missing.push("titulo");
        if (!descripcion) missing.push("descripcion");
        if (!archivoComprimido) missing.push("archivoComprimido");
        if (!tipo) missing.push("tipo");
        if (autores.some(autor => !autor)) missing.push("autores");
        if (selectedTecnologias.length === 0) missing.push("tecnologias");
        if (selectedCategorias.length === 0) missing.push("categorias");

        setMissingFields(missing);

        if (missing.length > 0) {
            setErrorMessage("Por favor, completa todos los campos.");
            return false;
        }

        setErrorMessage("");
        return true;
    };

    const addAutorField = () => {
        setAutores([...autores, ""]);
    };

    const removeAutorField = (index) => {
        const newAutores = autores.filter((_, i) => i !== index);
        setAutores(newAutores);
    };

    const handleAutorChange = (index, value) => {
        const newAutores = [...autores];
        newAutores[index] = value;
        setAutores(newAutores);
    };

    const toggleTecnologia = (tecnologia) => {
        if (selectedTecnologias.includes(tecnologia)) {
            setSelectedTecnologias(selectedTecnologias.filter(item => item !== tecnologia));
        } else {
            setSelectedTecnologias([...selectedTecnologias, tecnologia]);
        }
    };

    const toggleCategoria = (categoria) => {
        if (selectedCategorias.includes(categoria)) {
            setSelectedCategorias(selectedCategorias.filter(item => item !== categoria));
        } else {
            setSelectedCategorias([...selectedCategorias, categoria]);
        }
    };

    // Validar el código del curso
    const validarCodigoCurso = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/cursos/validarCodigo/${codigoCurso}`);
            const data = await response.json();
            if (response.ok) {
                setCursoValido(true);
                setCursoNombre(data.nombre_curso);
                alert(`Te has unido al curso de ${data.nombre_curso}`);
            } else {
                setCursoValido(false);
                setErrorMessage("El código del curso no existe.");
                alert("El código del curso no existe.");
            }
        } catch (error) {
            console.error("Error al validar el código del curso:", error);
            setErrorMessage("Error en la validación del curso.");
        }
    };

    const onSubmitForm = (e) => {
        e.preventDefault();
        if (tipo === "aula" && !cursoValido) {
            setErrorMessage("Debes validar el código del curso antes de continuar.");
            return;
        }
        setShowModal(true); // Mostrar la ventana de confirmación si todo está validado
    };

    const handleConfirm = async () => {
        try {
            const body = {
                titulo,
                descripcion,
                ruta_archivo_comprimido: archivoComprimido ? archivoComprimido.name : null,
                descripcion_licencia: necesitaLicencia ? descripcionLicencia : null,
                necesita_licencia: necesitaLicencia,
                tipo,
                codigo_curso: tipo === "aula" ? codigoCurso : null, // Enviar el código del curso si es aula
                usuario_id: userId, 
                tecnologias: selectedTecnologias.map(tecnologia => tecnologia.id), 
                categorias: selectedCategorias.map(categoria => categoria.id),
                autores 
            };
            
            console.log("Datos enviados:", body);

            const response = await fetch("http://localhost:5000/api/proyectos/subir", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                alert("Proyecto registrado correctamente");
                navigate("/profesor/dashboard");
            } else {
                const errorData = await response.json();
                console.error("Error al registrar el proyecto", errorData);
                setErrorMessage("Error al registrar el proyecto");
            }
        } catch (err) {
            console.error("Error en la solicitud:", err);
            setErrorMessage("Error en la solicitud: " + err.message);
        }
    };

    return (
        <div className="profesor-container">
            <Sidebar />
            <div className="main-content">
                <h1 className="text-center mt-5">Registrar Proyecto</h1>
                <form className="mt-5" onSubmit={onSubmitForm}>
                    {errorMessage && (
                        <div className="alert alert-danger">{errorMessage}</div>
                    )}

                    {/* Selección del tipo de proyecto */}
                    <div className="form-group">
                        <label>Tipo de Proyecto</label>
                        <select
                            className="form-control"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            required
                        >
                            <option value="">Selecciona una opción</option>
                            <option value="grado">Grado</option>
                            <option value="aula">Aula</option>
                        </select>
                    </div>

                    {/* Campo para validar el código del curso si es aula */}
                    {tipo === "aula" && (
                        <div className="form-group">
                            <label>Código del Curso</label>
                            <input
                                type="text"
                                className="form-control"
                                value={codigoCurso}
                                onChange={(e) => setCodigoCurso(e.target.value)}
                                required
                            />
                            <Button
                                variant="primary"
                                onClick={validarCodigoCurso}
                                className="mt-2"
                            >
                                Validar Código
                            </Button>
                        </div>
                    )}

                    {/* Los demás campos se habilitan solo si el curso es válido o si es un proyecto de grado */}
                    {(cursoValido || tipo === "grado") && (
                        <>
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${missingFields.includes("titulo") ? "border-danger" : ""}`}
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    className={`form-control ${missingFields.includes("descripcion") ? "border-danger" : ""}`}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                            <label>Autores</label>
                                {autores.map((autor, index) => (
                                    <div key={index} className="d-flex mb-2">
                                        <input
                                            type="text"
                                            className={`form-control ${missingFields.includes("autores") ? "border-danger" : ""}`}
                                            value={autor}
                                            onChange={(e) => handleAutorChange(index, e.target.value)}
                                            required
                                        />
                                        <button type="button" className="btn btn-primary ml-2" onClick={addAutorField}>+</button>
                                        {index > 0 && (
                                            <button type="button" className="btn btn-danger ml-2" onClick={() => removeAutorField(index)}>-</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="form-group">
                                <label>¿Necesita alguna licencia?</label>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        id="licenciaSi"
                                        name="licencia"
                                        value="si"
                                        checked={necesitaLicencia}
                                        onChange={() => setNecesitaLicencia(true)} // Establece "true" cuando se selecciona "Sí"
                                    />
                                    <label className="form-check-label" htmlFor="licenciaSi">
                                        Sí
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        id="licenciaNo"
                                        name="licencia"
                                        value="no"
                                        checked={!necesitaLicencia}
                                        onChange={() => setNecesitaLicencia(false)}  // Establece "false" cuando se selecciona "No"
                                    />
                                    <label className="form-check-label" htmlFor="licenciaNo">
                                        No
                                    </label>
                                </div>

                                {necesitaLicencia && (
                                    <div className="form-group mt-3">
                                        <label>Descripción de la Licencia</label>
                                        <textarea
                                            className="form-control"
                                            value={descripcionLicencia}
                                            onChange={(e) => setDescripcionLicencia(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Link de GitHub</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={linkGithub}
                                    onChange={(e) => setLinkGithub(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Archivo Comprimido</label>
                                <input
                                    type="file"
                                    className={`form-control ${missingFields.includes("archivoComprimido") ? "border-danger" : ""}`}
                                    onChange={(e) => setArchivoComprimido(e.target.files[0])}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tecnologías</label>
                                <div className={`${missingFields.includes("tecnologias") ? "border border-danger p-2" : ""}`}>
                                    {tecnologias.map((tecnologia) => (
                                        <button
                                            type="button"
                                            key={tecnologia.id}
                                            className={`btn m-1 ${selectedTecnologias.includes(tecnologia) ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => toggleTecnologia(tecnologia)}
                                        >
                                            {tecnologia.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Categorías</label>
                                <div className={`${missingFields.includes("categorias") ? "border border-danger p-2" : ""}`}>
                                    {categorias.map((categoria) => (
                                        <button
                                            type="button"
                                            key={categoria.id}
                                            className={`btn m-1 ${selectedCategorias.includes(categoria) ? "btn-success" : "btn-outline-success"}`}
                                            onClick={() => toggleCategoria(categoria)}
                                        >
                                            {categoria.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="btn btn-success mt-3">Registrar</Button>
                        </>
                    )}
                </form>

                {/* Modal de confirmación */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Registro</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Título:</strong> {titulo}</p>
                        <p><strong>Descripción:</strong> {descripcion}</p>
                        <p><strong>¿Necesita licencia?:</strong> {necesitaLicencia ? "Sí" : "No"}</p>
                        {necesitaLicencia && (
                            <p><strong>Descripción de la licencia:</strong> {descripcionLicencia}</p>
                        )}
                        <p><strong>Link de GitHub:</strong> {linkGithub}</p>
                        <p><strong>Archivo Comprimido:</strong> {archivoComprimido ? archivoComprimido.name : "No se ha subido ningún archivo"}</p>
                        <p><strong>Tipo de Proyecto:</strong> {tipo}</p>
                        <p><strong>Autores:</strong> {autores.join(", ")}</p>
                        <p><strong>Tecnologías:</strong> {selectedTecnologias.map(t => t.nombre).join(", ")}</p>
                        <p><strong>Categorías:</strong> {selectedCategorias.map(c => c.nombre).join(", ")}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleConfirm}>Confirmar y Registrar</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default SubirProyectoProfesor;
