import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InputGroup, Form, Button } from "react-bootstrap";
import { useBuscador } from '../../context/BuscadorContext';
import TarjetaProyecto from '../../utils/TarjetaProyecto';
import ProyectoModal from '../../utils/ProyectoModal';
import { FaArrowLeft} from 'react-icons/fa';
import '../../styles/BusquedaGlobal.css';

const ITEMS_PER_PAGE = 5;

const BusquedaGlobal = () => {
    const location = useLocation();
    const { resultados, loading, buscarProyectos } = useBuscador();
    const [consultaLocal, setConsultaLocal] = useState("");
    const [sortOrder, setSortOrder] = useState("reciente");
    const [currentPage, setCurrentPage] = useState(1);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('query');
        if (query) {
            setConsultaLocal(query);
            buscarProyectos(query, sortOrder);
        }
    }, [location.search, sortOrder]);

    const handleBuscar = () => {
        buscarProyectos(consultaLocal, sortOrder); 
    };

    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
    };

    const handlePageChange = (page) => {
        const totalPages = Math.ceil(resultados.length / ITEMS_PER_PAGE);
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleVerDetalles = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setProyectoSeleccionado(null);
    };

    // Función para enviar la solicitud de acceso
    const enviarSolicitud = async (proyectoId, motivo) => {
        try {
            const solicitudPendiente = await verificarSolicitudPendiente(proyectoId);
            if (solicitudPendiente) {
                alert('Ya existe una solicitud pendiente para este proyecto.');
                return;
            }

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
                cerrarModal();
            } else {
                alert('Error al enviar la solicitud');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
        }
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


    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProyectos = resultados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="busqueda-global-container d-flex flex-column align-items-center">
            <div className="navegar-atras-buscador" onClick={handleGoBack}>
                <FaArrowLeft className="icono-navegar-atras" /> Volver
            </div>
            <h1 className="busqueda-global-title mb-4">Repositorio Atlas</h1>
            <InputGroup className="busqueda-global-search-bar mb-4">
                <Form.Control
                    type="text"
                    placeholder="Buscar en el sistema"
                    value={consultaLocal}
                    onChange={(e) => setConsultaLocal(e.target.value)}
                    className="busqueda-global-search-input"
                />
                <Button variant="primary" onClick={handleBuscar} className="busqueda-global-search-button">
                    Buscar
                </Button>
            </InputGroup>

            <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="busqueda-global-sort-select mb-4"
            >
                <option value="reciente">Más Reciente</option>
                <option value="antiguo">Más Antiguo</option>
                <option value="relevancia">Relevancia</option>
                <option value="popularidad">Popularidad</option>
            </Form.Select>

            <div className="busqueda-global-projects-container">
                {loading ? (
                    <p>Cargando...</p>
                ) : resultados.length === 0 ? (
                    <p>No se encontraron resultados.</p>
                ) : (
                    paginatedProyectos.map((proyecto) => (
                        <TarjetaProyecto
                            key={proyecto.id}
                            proyecto={proyecto}
                            query={consultaLocal}
                            verDetalles={handleVerDetalles}
                            enviarSolicitud={enviarSolicitud}
                        />
                    ))
                )}
            </div>

            {resultados.length > 0 && (
                <div className="busqueda-global-pagination mt-4 d-flex justify-content-center">
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </Button>
                    <span className="mx-3">Página {currentPage} de {Math.ceil(resultados.length / ITEMS_PER_PAGE)}</span>
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === Math.ceil(resultados.length / ITEMS_PER_PAGE)}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {proyectoSeleccionado && (
                <ProyectoModal
                    show={showModal}
                    handleClose={cerrarModal}
                    proyecto={proyectoSeleccionado}
                    enviarSolicitud={enviarSolicitud}
                    omitDetails={true}
                />
            )}
        </div>
    );
};

export default BusquedaGlobal;
