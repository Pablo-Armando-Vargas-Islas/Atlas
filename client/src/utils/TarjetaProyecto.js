import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import ProyectoModal from '../utils/ProyectoModal';
import '../styles/TarjetaProyecto.css';

const TarjetaProyecto = ({ proyecto, query, enviarSolicitud }) => {
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

  // Función para resaltar cada palabra clave en un texto dado
  const highlightText = (text) => {
    if (!keywords.length) return text;

    // Crear una expresión regular con cada palabra clave
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');

    // Dividir el texto en partes, resaltando cada coincidencia
    return text.split(regex).map((part, index) =>
      keywords.some(keyword => part.toLowerCase() === keyword.toLowerCase()) ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  /* Definir el formato del tipo de trabajo (Aula o Grado)
  const renderTipoTrabajo = () => {
    if (tipo === "grado") {
      return <p>Trabajo de Grado</p>
    } else if (tipo === "aula") {
      return <p>Trabajo de Aula</p>
    } else {
      return <p>Desconocido</p>
    }
  };*/

  const tipoTrabajo = tipo === "grado" ? "Grado" : "Aula";

  // Manejar el clic en la tarjeta para abrir el modal
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
            {highlightText(titulo)}
            {/*renderTipoTrabajo()*/}
          </Card.Title>
          <div className="tarjeta-info">
            <p><strong>Proyecto de {highlightText(tipoTrabajo)}</strong></p>
            <p><strong>Descripción:</strong> {highlightText(descripcion)}</p>
            <p><strong>Fecha de Creación:</strong> {fecha_hora ? new Date(fecha_hora).toLocaleDateString() : 'Fecha no disponible'}</p>
            <p><strong>Autores:</strong> {
              autores.map((autor, idx) => (
                <span key={idx}>
                  {highlightText(autor)}
                  {idx < autores.length - 1 ? ', ' : ''}
                </span>
              ))
            }</p>
            
            <div className="tarjeta-tags mt-3">
              <strong>Tecnologías:</strong>
              {tecnologias.length > 0 ? (
                tecnologias.map((tec, idx) => (
                  <Badge key={idx} className="badge-tecnologia me-2">
                    {highlightText(tec)}
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
                    {highlightText(cat)}
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
