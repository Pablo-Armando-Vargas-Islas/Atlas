import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import ProyectoModal from '../ProyectoModal';
import TarjetaProyecto from '../TarjetaProyecto';
import '../styles/NavegarPorCategoria.css';

const NavegarPorCategoria = () => {
  const [proyectos, setProyectos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchProyectosPorCategoria = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No se encontró el token de autenticación.");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/proyectos/categoria', {
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

    fetchProyectosPorCategoria();
  }, []);

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
      const response = await fetch(`http://localhost:5000/api/proyectos/categoria?query=${searchTerm}`, {
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
      console.error("Error al obtener proyectos:", error);
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
    <div className="navegar-por-categoria-container d-flex flex-column align-items-center">
      <h1 className="navegar-categoria-title mb-4">Buscar Proyectos por Categoría</h1>
      <InputGroup className="search-bar mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar por categoría"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Button variant="primary" onClick={handleBuscar} className="search-button-categoria">
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
          <p>No se encontraron proyectos con la categoría especificada.</p>
        ) : (
          paginatedProyectos.map(proyecto => (
            <TarjetaProyecto
              key={proyecto.id}
              proyecto={proyecto}
              query={searchTerm} // Resaltar coincidencias en la tarjeta
              verDetalles={verDetalles}
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
        />
      )}
    </div>
  );
};

export default NavegarPorCategoria;
