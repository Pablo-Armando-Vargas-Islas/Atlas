import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import ProyectoModal from '../utils/ProyectoModal';
import '../styles/TarjetaProyecto.css';

const TarjetaProyecto = ({ proyecto, query, scope, enviarSolicitud }) => {
  const [showModal, setShowModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const {
    titulo,
    descripcion,
    tipo,
    tecnologias = [],
    categorias = [],
    fecha_hora,
    autores = [],
  } = proyecto;

  // Dividir la consulta en palabras clave
  const keywords = query ? query.split(' ').filter(Boolean) : [];

  // Función para resaltar coincidencias en un texto según el ámbito de búsqueda
  const highlightText = (text, scope, field) => {
    if (!keywords.length) return text;

    if (scope !== "global" && scope !== field) {
      return text;
    }

    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');

    return text.split(regex).map((part, index) =>
      keywords.some(keyword => part.toLowerCase() === keyword.toLowerCase()) ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  const tipoTrabajo = tipo === "grado" ? "Grado" : "Aula";

  const handleCardClick = () => {
    if (proyecto && proyecto.usuario_id) {
      setProyectoSeleccionado(proyecto);
      setShowModal(true);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setProyectoSeleccionado(null);
  };

  return (
    <>
      <Card className="tarjeta-proyecto mb-4" onClick={handleCardClick}>
        <Card.Body>
          <Card.Title>
            <span className="tipo-trabajo">
              {highlightText(`Proyecto de ${tipoTrabajo}`, scope, "tipoTrabajo")}
            </span>
            <br />
            <br />
            {highlightText(titulo, scope, "titulo")}
          </Card.Title>
          <div className="tarjeta-info">
            <p><strong>Descripción:</strong> {highlightText(descripcion, scope, "descripcion")}</p>
            <p>
              <strong>Fecha de Creación: </strong> 
              {fecha_hora 
                ? highlightText(new Date(fecha_hora).toLocaleDateString(), scope, "fecha_hora") 
                : 'Fecha no disponible'}
            </p>
            {proyecto.tipo === 'aula' && (
                <p><strong>Curso:</strong> {proyecto.nombre_curso}</p>
            )}
            <p><strong>Autores:</strong> {
              autores.map((autor, idx) => (
                <span key={idx}>
                  {highlightText(autor, scope, "autor")}
                  {idx < autores.length - 1 ? ', ' : ''}
                </span>
              ))
            }</p>
            
            <div className="tarjeta-tags mt-3">
              <strong>Tecnologías:</strong>
              {tecnologias.length > 0 ? (
                tecnologias.map((tec, idx) => (
                  <Badge key={idx} className="badge-tecnologia me-2">
                    {highlightText(tec, scope, "tecnologias")}
                  </Badge>
                ))
              ) : (
                <span className="text-muted"> No especificadas</span>
              )}
            </div>

            <div className="tarjeta-tags mt-3">
              <strong>Categorías:</strong>
              {categorias.length > 0 ? (
                categorias.map((cat, idx) => (
                  <Badge key={idx} className="badge-categoria me-2">
                    {highlightText(cat, scope, "categorias")}
                  </Badge>
                ))
              ) : (
                <span className="text-muted"> No especificadas</span>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Modal para solicitar acceso */}
      {proyectoSeleccionado && (
        <ProyectoModal
          show={showModal}
          handleClose={cerrarModal}
          proyecto={proyectoSeleccionado}
          enviarSolicitud={enviarSolicitud}
          omitDetails={true}
        />
      )}
    </>
  );
};

export default TarjetaProyecto;
