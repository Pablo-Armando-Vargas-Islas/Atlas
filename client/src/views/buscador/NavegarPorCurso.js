import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import ProyectoModal from '../../utils/ProyectoModal';
import TarjetaProyecto from '../../utils/TarjetaProyecto';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/NavegarPorCurso.css';
import API_URL from '../../Server';

const NavegarPorCurso = () => {
  const [proyectos, setProyectos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
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
        console.error("Error al obtener todos los proyectos:", error);
      }
    };

    fetchTodosLosProyectos();
  }, []);

  const fetchSugerencias = async (term) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/proyectos/cursos/sugerencias?query=${encodeURIComponent(term)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener sugerencias.");

      const data = await response.json();
      setSugerencias(data.slice(0, 5)); // Limitar a 5 sugerencias
    } catch (error) {
      console.error("Error al buscar sugerencias:", error);
    }
  };

  const handleBuscar = async (curso) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/proyectos/curso?curso=${encodeURIComponent(curso)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al realizar la búsqueda.");

      const data = await response.json(); 
      setFilteredProyectos(data);
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
    }
  };

  let debounceTimer;
  const handleInputChange = (e) => {
      const value = e.target.value.trim();
      setSearchTerm(value);

      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
          if (value.length > 0) {
              fetchSugerencias(value);
          } else {
              setSugerencias([]);
          }
      }, 300); // 300 ms de debounce
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
        handleBuscar(searchTerm.trim());
        setSugerencias([]); // Ocultar sugerencias después de buscar
    } else if (e.key === "ArrowDown") {
        navigateSuggestions("down");
    } else if (e.key === "ArrowUp") {
        navigateSuggestions("up");
    }
  };

  const navigateSuggestions = (direction) => {
    if (sugerencias.length === 0) return;

    setSelectedSuggestionIndex((prevIndex) => {
        if (direction === "down") {
            return (prevIndex + 1) % sugerencias.length;
        } else if (direction === "up") {
            return (prevIndex - 1 + sugerencias.length) % sugerencias.length;
        }
        return prevIndex;
    });
  };

  const handleSuggestionSelection = () => {
    if (selectedSuggestionIndex >= 0) {
        const selectedCurso = sugerencias[selectedSuggestionIndex];
        handleSuggestionClick(selectedCurso);
    }
  };

  const handleSuggestionClick = (curso) => {
    setSearchTerm(curso); 
    setSugerencias([]); 
    handleBuscar(curso); 
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProyectos = filteredProyectos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProyectos.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="navegar-por-curso-container d-flex flex-column align-items-center">
      <div className="navegar-atras-buscador" onClick={() => navigate(-1)}>
        <FaArrowLeft className="icono-navegar-atras" /> Volver
      </div>
      <h1 className="navegar-curso-title mb-4">Buscar Proyectos por Curso</h1>
      <div className="search-bar-curso">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre de curso"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="search-input"
        />
        {sugerencias.length > 0 && (
          <ul className="sugerencias-list">
            {sugerencias.map((sug, idx) => (
              <li
                key={idx}
                className={`sugerencia-item ${idx === selectedSuggestionIndex ? "active" : ""}`}
                onClick={() => handleSuggestionClick(sug)}
                onMouseEnter={() => setSelectedSuggestionIndex(idx)}
              >
                {sug}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="projects-container">
        {filteredProyectos.length === 0 && searchTerm ? (
          <p>No se encontraron proyectos para el curso especificado.</p>
        ) : (
          paginatedProyectos.map((proyecto) => (
            <TarjetaProyecto
              key={proyecto.id}
              proyecto={proyecto}
              query={searchTerm}
              verDetalles={() => setProyectoSeleccionado(proyecto)}
            />
          ))
        )}
      </div>

      {filteredProyectos.length > 0 && (
        <div className="pagination mt-4 d-flex justify-content-center">
          <Button variant="secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span className="mx-3">Página {currentPage} de {totalPages}</span>
          <Button variant="secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Siguiente
          </Button>
        </div>
      )}

      {proyectoSeleccionado && (
        <ProyectoModal
          show={true}
          handleClose={() => setProyectoSeleccionado(null)}
          proyecto={proyectoSeleccionado}
        />
      )}
    </div>
  );
};

export default NavegarPorCurso;
