import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import ProyectoModal from '../ProyectoModal';
import TarjetaProyecto from '../TarjetaProyecto';
import '../styles/NavegarPorCurso.css';

const NavegarPorCurso = () => {
  const [proyectos, setProyectos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState("");
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [cursos, setCursos] = useState([]);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Obtener los nombres y códigos de los cursos disponibles
    const fetchCursosDisponibles = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No se encontró el token de autenticación.");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/proyectos/cursos/nombres', {
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
        setCursos(data);
      } catch (error) {
        console.error("Error al obtener los cursos:", error);
      }
    };

    fetchCursosDisponibles();
  }, []);

  useEffect(() => {
    // Obtener todos los proyectos al cargar la vista o cuando no se seleccione curso
    const fetchTodosLosProyectos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No se encontró el token de autenticación.");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/proyectos/todos', {
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
        console.error("Error al obtener todos los proyectos:", error);
      }
    };

    fetchTodosLosProyectos();
  }, []);

  useEffect(() => {
    // Realizar la búsqueda cuando se seleccione un curso
    const fetchProyectosPorCurso = async () => {
      if (!selectedCurso) {
        setFilteredProyectos(proyectos);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No se encontró el token de autenticación.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/proyectos/curso?curso=${selectedCurso}`, {
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

    if (selectedCurso) {
      fetchProyectosPorCurso();
    } else {
      setFilteredProyectos(proyectos);
    }
  }, [selectedCurso, proyectos]);

  // Nueva función para manejar el cambio de curso seleccionado
  const handleCursoChange = (e) => {
    const codigoCursoSeleccionado = e.target.value.trim();
    setSelectedCurso(codigoCursoSeleccionado);
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
    <div className="navegar-por-curso-container d-flex flex-column align-items-center">
      <h1 className="navegar-curso-title mb-4">Buscar Proyectos por Curso</h1>
      <Form.Select
        value={selectedCurso}
        onChange={handleCursoChange} // Utilizamos la nueva función para manejar el cambio
        className="curso-select mb-4"
      >
        <option value="">Seleccione un Curso</option>
        {cursos.map((curso, index) => (
          <option key={index} value={curso.codigo_curso}>{curso.nombre_curso}</option>
        ))}
      </Form.Select>

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
        {filteredProyectos.length === 0 && selectedCurso ? (
          <p>No se encontraron proyectos para el curso seleccionado.</p>
        ) : (
          paginatedProyectos.map(proyecto => (
            <TarjetaProyecto
              key={proyecto.id}
              proyecto={proyecto}
              query={selectedCurso} // Resaltar coincidencias si corresponde
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

export default NavegarPorCurso;
