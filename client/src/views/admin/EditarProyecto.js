import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { Spinner } from 'react-bootstrap';
import JSZip from "jszip";
import "../../styles/SubirProyecto.css";

const API_URL = 'http://localhost:5000';

const EditarProyecto = () => {
    const { id: proyectoId } = useParams();
    const [userId, setUserId] = useState(null);
    const [proyecto, setProyecto] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [necesitaLicencia, setNecesitaLicencia] = useState(null);
    const [descripcionLicencia, setDescripcionLicencia] = useState("");
    const [archivoComprimido, setArchivoComprimido] = useState(null);
    const [tipo, setTipo] = useState(""); 
    const [codigoCurso, setCodigoCurso] = useState(""); 
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
    const [proyectoOriginal, setProyectoOriginal] = useState({});
    const [archivoCargado, setArchivoCargado] = useState(false);

    const navigate = useNavigate();

    // Aquí se realiza el desplazamiento cuando errorMessage cambia
    useEffect(() => {
        if (errorMessage) {
          // Desplazar la página hasta el inicio cuando haya un error
          window.scrollTo({
            top: 0, // Desplazamos hacia la parte superior
            behavior: 'smooth' // Desplazamiento suave
          });
        }
      }, [errorMessage]);

    // Recuperar el token del localStorage y decodificarlo
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id); // Establecer el userId decodificado desde el token
            } catch (error) {
                console.error("Error al decodificar el token:", error);
            }
        }
    }, []);

    // Fetch para obtener la informaci[on del proyecto
    useEffect(() => {
        const fetchProyecto = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/api/proyectos/proyecto/${proyectoId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
    
                    const data = await response.json();
                    setProyecto(data);
                    setProyectoOriginal(data);
                    setTitulo(data.titulo);
                    setDescripcion(data.descripcion);
                    setNecesitaLicencia(data.necesita_licencia);
                    setDescripcionLicencia(data.descripcion_licencia);
                    setArchivoComprimido(data.ruta_archivo_comprimido);
                    setFormatoAprobacion(data.formato_aprobacion);
                    setTipo(data.tipo);
                    setCodigoCurso(data.codigo_curso);
                    setCursoNombre(data.nombre_curso);
                    setAutores(data.autores);
                    setSelectedTecnologias(data.tecnologias);
                    setSelectedCategorias(data.categorias);
                } catch (err) {
                    console.error("Error al obtener el proyecto:", err);
                }
            }
        };
    
        fetchProyecto();
    }, [proyectoId]);        

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
    
            setErrorMessage(`Por favor, completa todos los campos: ${camposFaltantes.join(", ")}`);
            return false;
        }
    
        setErrorMessage("");
        return true;
    };      

    const addAutorField = () => {
        if (tipo === 'aula' && autores.length >= 5) {
            setErrorMessage("Solo se permiten hasta 5 autores en proyectos de aula.");
            return;
        } else if (tipo === 'grado' && autores.length >= 3) {
            setErrorMessage("Solo se permiten hasta 3 autores en proyectos de grado.");
            return;
        }
    
        setAutores([...autores, ""]);
        setErrorMessage(""); 
    };
    
    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
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

    const toggleTecnologia = (tecnologiaId) => {
        setSelectedTecnologias(prevState => {
            if (prevState.includes(tecnologiaId)) {
            return prevState.filter(item => item !== tecnologiaId);
            } else {
            return [...prevState, tecnologiaId];
            }
        });
    };
      
    const toggleCategoria = (categoriaId) => {
        setSelectedCategorias(prevState => {
            if (prevState.includes(categoriaId)) {
            return prevState.filter(item => item !== categoriaId);
            } else {
            return [...prevState, categoriaId];
            }
        });
    };  

    const getFileName = (filePath) => {
        if (typeof filePath === 'string') {
            return filePath.split('\\').pop();
        }
        return '';
    };

    const handleFileChange = (e) => {
        setArchivoComprimido(e.target.files[0]);
        setArchivoCargado(true);
    };
    
    const onSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        // Validar los campos antes de proceder
        if (!validateFields()) {
            setLoading(false);
            return; 
        }
    
        const token = localStorage.getItem('token');
    
        if (!token) {
            setErrorMessage("No se encontró un token de autenticación.");
            setLoading(false);
            return;
        }
    
        // Validar el archivo comprimido solo si se ha seleccionado uno nuevo
        if (archivoCargado && archivoComprimido) {
            const fileType = archivoComprimido.type;
            const fileSize = archivoComprimido.size;
    
            // Verificar tipo y tamaño del archivo
            const validTypes = ["application/zip", "application/x-zip-compressed"];
            const maxSizeInBytes = 1 * 1024 * 1024 * 1024; // 1GB
    
            if (!validTypes.includes(fileType)) {
                setErrorMessage("El archivo del proyecto debe ser .zip");
                setLoading(false);
                return;
            }
            if (fileSize > maxSizeInBytes) {
                setErrorMessage("El archivo no debe pesar más de 1GB, revisa que no contenga las carpetas con librerías como node_modules o vendor.");
                setLoading(false);
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
                
                // Revisar si alguna ruta tiene una carpeta prohibida
                zipData.forEach((relativePath) => {
                    forbiddenFolders.forEach((folder) => {
                        if (relativePath.includes(`/${folder}/`) || relativePath.startsWith(`${folder}/`)) {
                            containsForbiddenFolder = true;
                        }
                    });
    
                    forbiddenExtensions.forEach((ext) => {
                        if (relativePath.endsWith(ext)) {
                            containsForbiddenFile = true;
                        }
                    });
                });
    
                if (containsForbiddenFolder || containsForbiddenFile) {
                    setErrorMessage("El archivo contiene carpetas o archivos no permitidos (node_modules, vendor, packages, vendor/bundle, target, .gradle, build, dist, .terraform, .serverless, .exe, .msi, .apk).");
                    setLoading(false);
                    return;
                }
    
                setShowModal(true);
            } catch (error) {
                setErrorMessage("Error al leer el archivo .zip: " + error.message);
                setLoading(false);
                return;
            }
        }
    
        try {
            const formData = new FormData();
            formData.append("titulo", titulo);
            formData.append("descripcion", descripcion);
            if (archivoComprimido) {
                formData.append("archivoComprimido", archivoComprimido);
            }
            if (formatoAprobacion) {
                formData.append("formatoAprobacion", formatoAprobacion);
            }
            formData.append("descripcion_licencia", necesitaLicencia ? descripcionLicencia : "");
            formData.append("necesita_licencia", necesitaLicencia);
            formData.append("tipo", tipo);
            formData.append("codigo_curso", tipo === "aula" ? codigoCurso : "");
            formData.append("usuario_id", userId);
    
            // Filtrar valores null y asegurar que sean IDs numéricos
            const validTecnologias = selectedTecnologias.filter(tecnologia => !isNaN(tecnologia));
            const validCategorias = selectedCategorias.filter(categoria => !isNaN(categoria));
    
            formData.append("tecnologias", JSON.stringify(validTecnologias));
            formData.append("categorias", JSON.stringify(validCategorias));
            formData.append("autores", JSON.stringify(autores));
    
            const response = await fetch(`${API_URL}/api/proyectos/proyecto/actualizar/${proyectoId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: formData
            });
    
            if (response.ok) {
                setLoading(false);
                alert("Proyecto actualizado correctamente");
                navigate("/Buscador");
            } else {
                const errorData = await response.json();
                console.error("Error al actualizar el proyecto", errorData);
                setErrorMessage("Error al actualizar el proyecto: " + errorData.error);
            }
        } catch (err) {
            console.error("Error en la solicitud:", err);
            setErrorMessage("Error en la solicitud: " + err.message);
        } finally {
            setLoading(false); 
        }
    };        

    return (
        <div className="proyecto-container">
            <div className="proyecto-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center mt-5">Editar Proyecto</h1>
                <form className="mt-5" onSubmit={onSubmitForm}>
                    {errorMessage && (
                        <div className="alert alert-danger" ref={errorRef}>{errorMessage}</div>
                    )}
                    {tipo === "aula" && (
                        <div className="form-group">
                            <label>Curso</label>
                            <input
                                type="text"
                                className="form-control"
                                value={cursoNombre || ""}
                                disabled
                            />
                        </div>
                    )}
                    {tipo === "grado" && (
                        <div className="form-group">
                            <label>
                                {formatoAprobacion && (
                                    <span className="texto-azul">
                                        {`Formato de Aprobación -> "${getFileName(formatoAprobacion)}"`}
                                    </span>
                                )}
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                onChange={(e) => setFormatoAprobacion(e.target.files[0])}
                                accept=".png,.jpg,.jpeg"
                            />
                        </div>                    
                    )}
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            className="form-control"
                            value={titulo || ""}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            className="form-control"
                            value={descripcion || ""}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Autores</label>
                        {autores.map((autor, index) => (
                            <div key={index} className="d-flex mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={autor || ""}
                                    onChange={(e) => handleAutorChange(index, e.target.value)}
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
                                className="form-check-input"
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
                                    className="form-control"
                                    value={descripcionLicencia || ""}
                                    onChange={(e) => setDescripcionLicencia(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>
                            {archivoComprimido && (
                                <span className="texto-azul">
                                    {`Archivo Comprimido -> "${getFileName(archivoComprimido)}"`}
                                </span>
                            )}
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleFileChange} 
                            accept=".zip"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tecnologías</label>
                        <div>
                            {tecnologias.map((tecnologia) => (
                            <button
                                type="button"
                                key={tecnologia.id}
                                className={`btn m-1 ${selectedTecnologias.includes(tecnologia.id) ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => toggleTecnologia(tecnologia.id)}
                            >
                                {tecnologia.nombre}
                            </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Categorías</label>
                        <div>
                            {categorias.map((categoria) => (
                            <button
                                type="button"
                                key={categoria.id}
                                className={`btn m-1 ${selectedCategorias.includes(categoria.id) ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => toggleCategoria(categoria.id)}
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
                                'Guardar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );    
};

export default EditarProyecto;
