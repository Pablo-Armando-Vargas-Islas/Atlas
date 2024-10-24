// MisProyectos.js

import React, { useState, useEffect } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { jwtDecode as jwt_decode } from "jwt-decode";
import ProyectoModal from '../ModalBuscador'; // Importar ProyectoModal
import TarjetaProyecto from '../TarjetaProyecto'; 
import '../styles/MisProyectos.css';

const ITEMS_PER_PAGE = 10;

const MisProyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortCriterion, setSortCriterion] = useState("reciente");

    // Obtener el id del usuario del token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwt_decode(token);
            if (decodedToken && decodedToken.id) {
                setUserId(decodedToken.id);
            } else {
                console.error("Token inválido o sin id");
            }
        }
    }, []);

    // Fetch para obtener los proyectos del usuario
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;

        const fetchProyectosWithRetry = async () => {
            if (userId) {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/proyectos`, {
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
                        setProyectos(data);
                    } catch (err) {
                        console.error("Error al obtener los proyectos:", err);
                        if (retryCount < maxRetries) {
                            retryCount++;
                            setTimeout(fetchProyectosWithRetry, 2000);
                        } else {
                            console.error("Se alcanzó el número máximo de reintentos");
                        }
                    }
                }
            }
        };

        if (userId) {
            fetchProyectosWithRetry();
        }
    }, [userId]);

    // Función para mostrar el modal con el formulario de solicitud de acceso directamente
    const verDetalles = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    // Función para verificar si ya existe una solicitud pendiente antes de enviar una nueva solicitud
    const verificarSolicitudPendiente = async (proyectoId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes/verificar/${proyectoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data.pendiente;
            } else {
                console.error('Error al verificar la solicitud pendiente');
                return false;
            }
        } catch (error) {
            console.error('Error al verificar la solicitud pendiente:', error);
            return false;
        }
    };

    // Función para enviar la solicitud de acceso
    const enviarSolicitud = async (proyectoId, motivo) => {
        const solicitudPendiente = await verificarSolicitudPendiente(proyectoId);
        if (solicitudPendiente) {
            alert('Ya existe una solicitud pendiente para este proyecto.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/solicitudes/crear', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proyecto_id: proyectoId,
                    motivo: motivo,
                }),
            });

            if (response.ok) {
                alert('Solicitud enviada con éxito');
                setShowModal(false);
            } else {
                alert('Error al enviar la solicitud');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
        }
    };

    // Filtrar y ordenar proyectos por búsqueda en "Mis Proyectos"
    const filteredProyectos = proyectos
        .filter((proyecto) => {
            // Si el término de búsqueda está vacío, no aplicar ningún filtro
            if (searchTerm.trim() === "") {
                return true;
            }

            // Dividir la búsqueda en términos
            const searchTerms = searchTerm.toLowerCase().split(" ").filter(term => term.trim() !== "");

            // Verificar si al menos uno de los términos de búsqueda está presente en alguno de los campos del proyecto
            return searchTerms.some((term) => {
                return (
                    proyecto.titulo.toLowerCase().includes(term) ||
                    proyecto.autores.some((autor) => autor.toLowerCase().includes(term)) ||
                    proyecto.tecnologias.some((tecnologia) => tecnologia.toLowerCase().includes(term)) ||
                    proyecto.tipo.toLowerCase().includes(term)
                );
            });
        })
        .sort((a, b) => {
            if (sortCriterion === "reciente") {
                return new Date(b.fecha_hora) - new Date(a.fecha_hora);
            } else if (sortCriterion === "popularidad") {
                return b.popularidad - a.popularidad;
            } else if (sortCriterion === "relevancia") {
                return b.relevancia - a.relevancia;
            }
            return 0;
        });

    // Calcular la paginación
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProyectos = filteredProyectos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredProyectos.length / ITEMS_PER_PAGE);

    // Cambiar página
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="mis-proyectos-box d-flex flex-column align-items-center">
            <h1 className="mis-proyectos-title mb-4">Mis Proyectos</h1>

            {/* Barra de búsqueda para "Mis Proyectos" */}
            <InputGroup className="search-bar mb-4">
                <Form.Control
                    type="text"
                    placeholder="Buscar en mis proyectos"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <Button variant="primary" className="search-button-misProyectos">
                    Buscar
                </Button>
            </InputGroup>

            {/* Selector de criterio de orden */}
            <div className="sort-container mb-4">
                <Form.Select
                    value={sortCriterion}
                    onChange={(e) => setSortCriterion(e.target.value)}
                >
                    <option value="reciente">Reciente</option>
                    <option value="popularidad">Popularidad</option>
                    <option value="relevancia">Relevancia</option>
                </Form.Select>
            </div>

            {/* Contenedor de proyectos usando TarjetaProyecto */}
            <div className="projects-container">
                {filteredProyectos.length === 0 ? (
                    <p>No se ha podido encontrar ningún proyecto.</p>
                ) : (
                    paginatedProyectos.map((proyecto) => (
                        <TarjetaProyecto
                            key={proyecto.id}
                            proyecto={proyecto}
                            query={searchTerm} // Pasar el término de búsqueda para resaltar las coincidencias
                            onVerDetalles={() => verDetalles(proyecto)} // Mostrar detalles en el modal para solicitar acceso
                        />
                    ))
                )}
            </div>

            {/* Paginación */}
            {filteredProyectos.length > 0 && (
                <div className="pagination mt-4 d-flex justify-content-center">
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </Button>
                    <span className="mx-3">Página {currentPage} de {totalPages}</span>
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {/* Modal reutilizable para mostrar directamente el formulario de solicitud */}
            {proyectoSeleccionado && (
                <ProyectoModal
                    show={showModal}
                    handleClose={cerrarModal}
                    proyecto={proyectoSeleccionado}
                    enviarSolicitud={enviarSolicitud} // Pasamos la función enviarSolicitud como prop al modal
                />
            )}
        </div>
    );
};

export default MisProyectos;
