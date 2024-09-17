import React, { useState, useContext } from "react";
import "../styles/Sidebar.css";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { logout } = useContext(AuthContext); // Función de logout desde el contexto de autenticación

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="wrapper">
            <aside id="sidebar" className={isExpanded ? "expand" : ""}>
                <div className="d-flex">
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        <i className="lni lni-grid-alt"></i>
                    </button>
                    <div className="sidebar-title">
                        <span>Bienvenido</span>
                    </div>
                </div>
                <ul className="sidebar-nav">
                    <li className="sidebar-item">
                        <a href="/perfil" className="sidebar-link">
                            <i className="lni lni-user"></i>
                            <span>Perfil</span>
                        </a>
                    </li>
                    <li className="sidebar-item">
                        <a href="/profesor/SubirProyectoProfesor" className="sidebar-link">
                            <i className="lni lni-upload"></i>
                            <span>Subir Proyectos</span>
                        </a>
                    </li>
                    <li className="sidebar-item">
                        <a href="/mis-cursos" className="sidebar-link">
                            <i className="lni lni-book"></i>
                            <span>Mis Cursos</span>
                        </a>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <button className="btn-logout" onClick={logout}>
                        <i className="lni lni-exit"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;
