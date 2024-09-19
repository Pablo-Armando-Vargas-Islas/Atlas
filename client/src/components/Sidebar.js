import React, { useState } from "react";
import { CaretLeft, CaretRight, HouseSimple, FolderSimple, ChalkboardTeacher, Gear, SignOut } from "phosphor-react"; // Importa los iconos
import "./styles/Sidebar.css";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded); // Alternar el estado de expansión
  };

  return (
    <div className={`sidebar ${isExpanded ? "active" : ""}`}>
      <div className="menu-btn" onClick={toggleSidebar}>
        {isExpanded ? <CaretRight size={24} /> : <CaretLeft size={24} />}
      </div>
      <div className="head">
        <div className="user-img">
        <img src="/LogoUDES.png" alt="Logo" />
        </div>
        <div className={`user-details ${isExpanded ? "hidden" : ""}`}>
          {/*<p className="name">Juan Carlos</p>*/}
        </div>
      </div>
      <div className="nav">
        <div className="menu">
          <p className="title">Menú</p>
          <ul>
            <li>
              <a href="/profesor/cursos" data-tooltip="Ver cursos">
                <HouseSimple size={24} />
                <span className="text">Ver cursos</span>
              </a>
            </li>
            <li>
              <a href="/profesor/SubirProyectoProfesor" data-tooltip="Subir proyecto">
                <FolderSimple size={24} />
                <span className="text">Proyectos</span>
              </a>
            </li>
            <li>
              <a href="#" data-tooltip="Clases">
                <ChalkboardTeacher size={24} />
                <span className="text">Clases</span>
              </a>
            </li>
            <li>
              <a href="/profesor/crearCurso" data-tooltip="Cursos">
                <FolderSimple size={24} />
                <span className="text">Cursos</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="menu logout-menu">
        <p className="title">Cuenta</p>
        <ul>
          <li>
            <a href="#" data-tooltip="Cerrar Sesión">
              <SignOut size={24} />
              <span className="text">Cerrar Sesión</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
