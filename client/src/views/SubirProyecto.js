import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Modal, Button } from "react-bootstrap";
import { Spinner } from 'react-bootstrap';
import JSZip from "jszip";
import "../styles/SubirProyecto.css";

const API_URL = 'http://localhost:5000';

const SubirProyectoProfesor = () => {
    const [userId, setUserId] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [necesitaLicencia, setNecesitaLicencia] = useState(null);
    const [descripcionLicencia, setDescripcionLicencia] = useState("");
    const [archivoComprimido, setArchivoComprimido] = useState(null);
    const [tipo, setTipo] = useState(""); 
    const [codigoCurso, setCodigoCurso] = useState(""); 
    const [cursoValido, setCursoValido] = useState(false); 
    const [cursoNombre, setCursoNombre] = useState(""); 
    const [autores, setAutores] = useState([""]);
    const [tecnologias, setTecnologias] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedTecnologias, setSelectedTecnologias] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const errorRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    const [cursoEstado, setCursoEstado] = useState("");
    const [formatoAprobacion, setFormatoAprobacion] = useState(null);
    const [showCursoModal, setShowCursoModal] = useState(false);
    const [cursoModalMessage, setCursoModalMessage] = useState("");
    const [cursoValidado, setCursoValidado] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (errorMessage) {
          // Desplazar la página hasta el inicio cuando haya un error para poder leer el error
          window.scrollTo({
            top: 0, 
            behavior: 'smooth' 
          });
        }
      }, [errorMessage]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id); 
            } catch (error) {
                console.error("Error al decodificar el token:", error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchTecnologias = async () => {
            try {
                const response = await fetch(`${API_URL}/api/proyectos/tecnologias`);
                const data = await response.json();
                setTecnologias(data); 
            } catch (error) {
                console.error("Error al obtener las tecnologías:", error);
            }
        };

        const fetchCategorias = async () => {
            try {
                const response = await fetch(`${API_URL}/api/proyectos/categorias`);
                const data = await response.json();
                setCategorias(data); 
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
            }
        };

        fetchTecnologias();
        fetchCategorias();
    }, []);

    const validateFields = () => {
        const missing = [];
        if (tipo === "grado" && !formatoAprobacion) missing.push("formatoAprobacion");
        if (!titulo) missing.push("titulo");
        if (!descripcion) missing.push("descripcion");
        if (necesitaLicencia === null) missing.push("necesitaLicencia");
        if (necesitaLicencia === true && !descripcionLicencia) missing.push("descripcionLicencia");
        if (!archivoComprimido) missing.push("archivoComprimido");
        if (!tipo) missing.push("tipo");
        if (autores.some(autor => !autor)) missing.push("autores");
        if (selectedTecnologias.length === 0) missing.push("tecnologias");
        if (selectedCategorias.length === 0) missing.push("categorias");
    
        setMissingFields(missing);
    
        if (missing.length > 0) {
            const camposFaltantes = missing.map((field) => {
                switch (field) {
                    case "titulo":
                        return "Título";
                    case "descripcion":
                        return "Descripción";
                    case "necesitaLicencia":
                        return "¿Necesita alguna licencia?";
                    case "descripcionLicencia":
                        return "Descripción de la Licencia";
                    case "archivoComprimido":
                        return "Archivo Comprimido";
                    case "formatoAprobacion":
                        return "Formato de Aprobación";
                    case "autores":
                        return "Autores";
                    case "tecnologias":
                        return "Tecnologías";
                    case "categorias":
                        return "Categorías";
                    default:
                        return field;
                }
            });
    
            setErrorMessage(`Por favor, completa los campos: ${camposFaltantes.join(", ")}`);
            return false;
        }
    
        setErrorMessage("");
        return true;
    };      

    const addAutorField = () => {
        if (tipo === 'aula' && autores.length >= 5) {
            setErrorMessage("Solo se permiten hasta 5 autores.");
            return;
        } else if (tipo === 'grado' && autores.length >= 3) {
            setErrorMessage("Solo se permiten hasta 3 autores.");
            return;
        }
    
        setAutores([...autores, ""]);
        setErrorMessage(""); 
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
        setErrorMessage("");
        setCursoModalMessage("");
        try {
            const response = await fetch(`${API_URL}/api/cursos/validarCodigo/${codigoCurso}`);
            const data = await response.json();
    
            if (response.ok) {
                setCursoNombre(data.nombre_curso);
                setCursoEstado(data.estado); 
    
                if (data.estado === "cerrado") {
                    setCursoValido(false); 
                    setCursoModalMessage(`El curso "${data.nombre_curso}" ya no está recibiendo más trabajos.`);
                } else {
                    setCursoValido(true); 
                    setCursoModalMessage(`Muy bien! Tu proyecto se subirá en el curso "${data.nombre_curso}"`);
                    setCursoValidado(true);
                }
            } else {
                setCursoValido(false);
                setErrorMessage("No se encontró el curso, revise el código por favor.");
                setCursoModalMessage("No se encontró el curso, revise el código por favor.");
            }
        } catch (error) {
            console.error("Error al validar el código del curso:", error);
            setErrorMessage("Error en la validación del curso.");
        }
        setShowCursoModal(true);
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {

            if (!validateFields()) {
                return; 
            }
        
            const token = localStorage.getItem('token');
        
            if (!token) {
                setErrorMessage("No se encontró un token de autenticación.");
                return;
            }

            const checkResponse = await fetch(`${API_URL}/api/proyectos/titulo-existe?titulo=${encodeURIComponent(titulo)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!checkResponse.ok) {
                throw new Error("Error en la respuesta al validar el título.");
            }
    
            const checkData = await checkResponse.json();
    
            if (checkData.exists) {
                setErrorMessage("El título del proyecto ya está registrado. Por favor, elige otro título.");
                return; 
            }

            if (archivoComprimido) {
                const fileType = archivoComprimido.type;
                const fileSize = archivoComprimido.size;
        
                // Verificar tipo y tamaño del archivo
                const validTypes = ["application/zip", "application/x-zip-compressed"];
                const maxSizeInBytes = 1 * 1024 * 1024 * 1024; // 1GB
        
                if (!validTypes.includes(fileType)) {
                    setErrorMessage("Solo se aceptan archivos .zip");
                    return;
                }
                if (fileSize > maxSizeInBytes) {
                    setErrorMessage("El archivo no debe pesar más de 1GB, revisa que no contenga las carpetas con librerías o ejecutables.");
                    return;
                }
        
                // Validar contenido del archivo .zip 
                const zip = new JSZip();
                try {
                    const zipData = await zip.loadAsync(archivoComprimido);
        
                    // Nombres de carpetas no permitidas
                    const forbiddenFolders = [
                        "node_modules", "vendor", "packages", "vendor/bundle", 
                        "target", ".gradle", "build", "dist", ".terraform", ".serverless"
                    ];                    
                    let containsForbiddenFolder = false;

                    // Extensiones de archivos no permitidas
                    const forbiddenExtensions = [".exe", ".msi", ".apk"];

                    let containsForbiddenFile = false;
                    
                    // Revisar si alguna ruta empieza con una carpeta prohibida
                    zipData.forEach((relativePath) => {
                        forbiddenFolders.forEach((folder) => {
                            if (relativePath.includes(`/${folder}/`) || relativePath.startsWith(`${folder}/`)) {
                                containsForbiddenFolder = true;
                            }
                        });

                        // Verificar extensiones prohibidas
                        forbiddenExtensions.forEach((ext) => {
                            if (relativePath.endsWith(ext)) {
                                containsForbiddenFile = true;
                            }
                        });
                    });
        
                    if (containsForbiddenFolder) {
                        setErrorMessage("Tu proyecto contiene carpetas no permitidas (node_modules, vendor, packages, vendor/bundle, target, .gradle, build, dist, .terraform, .serverless).");
                        return;
                    }
                    
                    if (containsForbiddenFile) {
                        setErrorMessage("Tu proyecto contiene archivos no permitidos (.exe .msi .apk).");
                        return;
                    }

                    setShowModal(true);
                } catch (error) {
                    setErrorMessage("Error al leer el archivo .zip: " + error.message);
                    return;
                }
            }
        } catch (err) {
            console.error("Error al validar el título del proyecto:", err);
            setErrorMessage("Error al validar el título del proyecto: " + err.message);
            return;
        } finally {
            setLoading(false); 
        }
    
        setShowModal(true);
    };

    const handleConfirm = async () => {
        try {
            const formData = new FormData();
            formData.append("formatoAprobacion", formatoAprobacion);
            formData.append("titulo", titulo);
            formData.append("descripcion", descripcion);
            formData.append("archivoComprimido", archivoComprimido);
            formData.append("descripcion_licencia", necesitaLicencia ? descripcionLicencia : "");
            formData.append("necesita_licencia", necesitaLicencia);
            formData.append("tipo", tipo);
            formData.append("codigo_curso", tipo === "aula" ? codigoCurso : "");
            formData.append("usuario_id", userId);
            formData.append("tecnologias", JSON.stringify(selectedTecnologias.map(tecnologia => tecnologia.id)));
            formData.append("categorias", JSON.stringify(selectedCategorias.map(categoria => categoria.id)));
            formData.append("autores", JSON.stringify(autores));
    
            const token = localStorage.getItem('token');
    
            if (!token) {
                throw new Error('No token provided');
            }
    
            const response = await fetch(`${API_URL}/api/proyectos/subir`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: formData
            });
    
            if (response.ok) {
                alert("Proyecto registrado correctamente");
                navigate("/Buscador");
            } else {
                const errorData = await response.json();
                console.error("Error al registrar el proyecto", errorData);
                setErrorMessage("Error al registrar el proyecto: " + errorData.error);
            }
        } catch (err) {
            console.error("Error en la solicitud:", err);
            setErrorMessage("Error en la solicitud: " + err.message);
        }
    };
    
    

    return (
        <div className="proyecto-container">
            <div className="proyecto-main-content">
                <h1 className="text-center mt-5">Registrar Proyecto</h1>
                <form className="mt-5" onSubmit={onSubmitForm}>
                    {errorMessage && (
                        <div className="alert alert-danger" ref={errorRef}>{errorMessage}</div>
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
                            <option value="aula">Aula</option>
                            <option value="grado">Grado</option>
                        </select>
                    </div>

                    {/* Campo para validar el código del curso si es de tipo aula */}
                    {tipo === "aula" && (
                        <div className="form-group">
                            <label>Curso</label>
                            {cursoValidado ? (
                                <>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cursoNombre}
                                        disabled
                                    />
                                    <Button
                                        variant="warning"
                                        onClick={() => {
                                            setCursoValidado(false);
                                            setCodigoCurso("");
                                            setCursoValido(false);
                                        }}
                                        className="mt-2"
                                    >
                                        Cambiar Curso
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={codigoCurso}
                                        onChange={(e) => setCodigoCurso(e.target.value)}
                                        required
                                    />
                                    <Button
                                        onClick={validarCodigoCurso}
                                        className="btn-validar mt-2"
                                    >
                                        Validar Código
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Los demás campos se habilitan solo si el curso es válido o si es un proyecto de grado */}
                    {(cursoValido) && cursoEstado !== "cerrado" && (
                        <>
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${missingFields.includes("titulo") ? "border-danger" : ""}`}
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    className={`form-control ${missingFields.includes("descripcion") ? "border-danger" : ""}`}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    
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
                                            
                                        />
                                        <button type="button" className="btn btn-primary ml-2" onClick={addAutorField}>+</button>
                                        {index > 0 && (
                                            <button type="button" className="btn btn-danger ml-2" onClick={() => removeAutorField(index)}>-</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className={`form-group ${missingFields.includes("necesitaLicencia") ? "border-danger p-3 rounded" : ""}`}>
                                <label>¿Necesita alguna licencia?</label>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className={`form-check-imput ${missingFields.includes("necesitaLicencia") ? "border-danger" : ""}`}
                                        id="licenciaSi"
                                        name="licencia"
                                        value="si"
                                        checked={necesitaLicencia === true}
                                        onChange={() => setNecesitaLicencia(true)} 
                                    />
                                    <label className="form-check-label" htmlFor="licenciaSi">
                                        Sí
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className={`form-check-imput ${missingFields.includes("necesitaLicencia") ? "border-danger" : ""}`}
                                        id="licenciaNo"
                                        name="licencia"
                                        value="no"
                                        checked={necesitaLicencia === false}
                                        onChange={() => setNecesitaLicencia(false)}  
                                    />
                                    <label className="form-check-label" htmlFor="licenciaNo">
                                        No
                                    </label>
                                </div>

                                {necesitaLicencia && (
                                    <div className="form-group mt-3">
                                        <label>Descripción de la Licencia</label>
                                        <textarea
                                            className={`form-control ${missingFields.includes("descripcionLicencia") ? "border-danger" : ""}`}
                                            value={descripcionLicencia}
                                            onChange={(e) => setDescripcionLicencia(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Archivo Comprimido</label>
                                <input
                                    type="file"
                                    className={`form-control ${missingFields.includes("archivoComprimido") ? "border-danger" : ""}`}
                                    onChange={(e) => setArchivoComprimido(e.target.files[0])}
                                    accept=".zip"
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
                            <div className="contenedor-boton-subir">
                                <button
                                    type="submit"
                                    className={`btn-subir-proyecto mt-3 ${loading ? "loading-button" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        </>
                                    ) : (
                                        'Registrar'
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {tipo === "grado" && (
                        <>
                            <div className="form-group">
                                <label>Formato de Aprobación (Imagen)</label>
                                <input
                                    type="file"
                                    className={`form-control ${missingFields.includes("formatoAprobacion") ? "border-danger" : ""}`}
                                    onChange={(e) => setFormatoAprobacion(e.target.files[0])}
                                    accept=".png,.jpg,.jpeg" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${missingFields.includes("titulo") ? "border-danger" : ""}`}
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    className={`form-control ${missingFields.includes("descripcion") ? "border-danger" : ""}`}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    
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
                                            
                                        />
                                        <button type="button" className="btn btn-primary ml-2" onClick={addAutorField}>+</button>
                                        {index > 0 && (
                                            <button type="button" className="btn btn-danger ml-2" onClick={() => removeAutorField(index)}>-</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className={`form-group ${missingFields.includes("necesitaLicencia") ? "border-danger p-3 rounded" : ""}`}>
                                <label>¿Necesita alguna licencia?</label>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className={`form-check-imput ${missingFields.includes("necesitaLicencia") ? "border-danger" : ""}`}
                                        id="licenciaSi"
                                        name="licencia"
                                        value="si"
                                        checked={necesitaLicencia === true}
                                        onChange={() => setNecesitaLicencia(true)} 
                                    />
                                    <label className="form-check-label" htmlFor="licenciaSi">
                                        Sí
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className={`form-check-imput ${missingFields.includes("necesitaLicencia") ? "border-danger" : ""}`}
                                        id="licenciaNo"
                                        name="licencia"
                                        value="no"
                                        checked={necesitaLicencia === false}
                                        onChange={() => setNecesitaLicencia(false)}  
                                    />
                                    <label className="form-check-label" htmlFor="licenciaNo">
                                        No
                                    </label>
                                </div>

                                {necesitaLicencia && (
                                    <div className="form-group mt-3">
                                        <label>Descripción de la Licencia</label>
                                        <textarea
                                            className={`form-control ${missingFields.includes("descripcionLicencia") ? "border-danger" : ""}`}
                                            value={descripcionLicencia}
                                            onChange={(e) => setDescripcionLicencia(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Archivo Comprimido</label>
                                <input
                                    type="file"
                                    className={`form-control ${missingFields.includes("archivoComprimido") ? "border-danger" : ""}`}
                                    onChange={(e) => setArchivoComprimido(e.target.files[0])}
                                    accept=".zip" 
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
                            <div className="contenedor-boton-subir">
                                <button
                                    type="submit"
                                    className={`btn-subir-proyecto mt-3 ${loading ? "loading-button" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                style={{ marginRight: '8px', color: '#ffffff' }}
                                            />
                                        </>
                                    ) : (
                                        'Registrar'
                                    )}
                                </button>
                            </div>
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

                {/* Modal para mostrar el mensaje del curso */}
                <Modal show={showCursoModal} onHide={() => setShowCursoModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Resultado</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{cursoModalMessage}</p>
                    </Modal.Body>
                </Modal>

            </div>
        </div>
    );
};

export default SubirProyectoProfesor;
