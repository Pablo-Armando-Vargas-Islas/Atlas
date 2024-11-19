import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import ProyectoModal from '../../utils/ProyectoModal';
import TarjetaProyecto from '../../utils/TarjetaProyecto';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft} from 'react-icons/fa';
import '../../styles/NavegarPorTitulo.css';
import API_URL from '../../Server';

const NavegarPorTitulo = () => {
  const [proyectos, setProyectos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchTodosLosProyectos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No se encontró el token de autenticación.");
        return;
      }
  
      try {
        const response = await fetch(`${API_URL}/api/proyectos/todos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
  
        const data = await response.json();
        setProyectos(data);
        setFilteredProyectos(data);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      }
    };
  
    fetchTodosLosProyectos();
  }, []);

  const handleGoBack = () => {
    navigate(-1); 
  };

  const handleBuscar = async () => {
    if (!searchTerm) {
      setFilteredProyectos(proyectos);
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No se encontró el token de autenticación.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/proyectos/titulo?query=${encodeURIComponent(searchTerm)}&orden=${orden}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      setFilteredProyectos(data); 
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
    }
  };  

  const enviarSolicitud = async (proyectoId, motivo) => {
    try {
        const solicitudPendiente = await verificarSolicitudPendiente(proyectoId);
        if (solicitudPendiente) {
            alert('Ya existe una solicitud pendiente para este proyecto.');
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/solicitudes/crear`, {
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
          const response = await fetch(`${API_URL}/api/solicitudes/verificar/${proyectoId}`, {
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

  const handleOrderChange = (e) => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);

    const sortedProyectos = [...filteredProyectos].sort((a, b) => {
      if (nuevoOrden === "reciente") {
        return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      } else if (nuevoOrden === "antiguo") {
        return new Date(a.fecha_hora) - new Date(b.fecha_hora);
      } else if (nuevoOrden === "popularidad") {
        return b.popularidad - a.popularidad;
      } else if (nuevoOrden === "relevancia") {
        return b.relevancia - a.relevancia;
      }
      return 0;
    });

    setFilteredProyectos(sortedProyectos);
  };

  const verDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setProyectoSeleccionado(null);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProyectos = filteredProyectos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProyectos.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="navegar-por-titulo-container d-flex flex-column align-items-center">
      <div className="navegar-atras-buscador" onClick={handleGoBack}>
          <FaArrowLeft className="icono-navegar-atras-titulo" /> Volver
      </div>
      <h1 className="navegar-title mb-4">Buscar Proyectos por Título</h1>
      <InputGroup className="search-bar mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar por título"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
                handleBuscar();
            }
        }}
        />
        <Button variant="primary" onClick={handleBuscar} className="search-button-titulo">
          Buscar
        </Button>
      </InputGroup>
  
      <Form.Select
        value={orden}
        onChange={handleOrderChange}
        className="sort-select mb-4"
      >
        <option value="reciente">Reciente</option>
        <option value="antiguo">Más Antiguo</option>
        <option value="relevancia">Relevancia</option>
        <option value="popularidad">Popularidad</option>
      </Form.Select>
  
      <div className="projects-container">
        {filteredProyectos.length === 0 && searchTerm ? (
          <p>No se encontraron proyectos con el título especificado.</p>
        ) : (
          filteredProyectos.map(proyecto => (
            <TarjetaProyecto
              key={proyecto.id}
              proyecto={proyecto}
              query={searchTerm}
              scope="titulo"
              verDetalles={verDetalles}
              enviarSolicitud={enviarSolicitud}
            />
          ))
        )}
      </div>

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

      {proyectoSeleccionado && (
        <ProyectoModal
          show={showModal}
          handleClose={cerrarModal}
          proyecto={proyectoSeleccionado}
          enviarSolicitud={enviarSolicitud}
        />
      )}
    </div>
  );  
};

export default NavegarPorTitulo;
