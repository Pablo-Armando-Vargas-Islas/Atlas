// src/components/TarjetaProyecto.js
import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import ProyectoModal from '../components/ModalBuscador'; // Importar el modal que queremos abrir
import './styles/TarjetaProyecto.css';

const TarjetaProyecto = ({ proyecto, query }) => {
  const [showModal, setShowModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const {
    titulo,
    descripcion,
    tipo, // Grado o Aula
    tecnologias = [], // Valor predeterminado
    categorias = [], // Valor predeterminado
    fecha_hora,
    autores = [], // Valor predeterminado
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

  // Definir el formato del tipo de trabajo (Aula o Grado)
  const renderTipoTrabajo = () => {
    if (tipo === "grado") {
      return <Badge className="badge-tipo-grado ms-2 badge-sm">Trabajo de Grado</Badge>;
    } else if (tipo === "aula") {
      return <Badge className="badge-tipo-aula ms-2 badge-sm">Proyecto de Aula</Badge>;
    } else {
      return <Badge className="badge-tipo-desconocido ms-2 badge-sm">Tipo desconocido</Badge>;
    }
  };

  // Manejar el clic en la tarjeta para abrir el modal
  const handleCardClick = () => {
    setProyectoSeleccionado(proyecto);
    setShowModal(true);
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
            {renderTipoTrabajo()}
          </Card.Title>
          <div className="tarjeta-info">
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
        />
      )}
    </>
  );
};

export default TarjetaProyecto;
