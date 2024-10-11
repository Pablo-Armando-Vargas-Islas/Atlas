import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importamos el AuthContext
import './styles/Navbar.css'; // Asegúrate de importar el archivo CSS

const Navbar = () => {
    const { rol, logout } = useContext(AuthContext); // Extraemos logout del AuthContext

    return (
        <nav className="navbar navbar-expand-lg custom-navbar">
            <div className="container-fluid justify-content-center">
                <a className="navbar-brand navbar-logo" href="#">ATLAS</a>

                {/* Botón del navbar para pantallas pequeñas */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido del navbar */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                    <ul className="navbar-nav navbar-links">
                        
                        {rol === 2 && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profesor/cursos">Mis Cursos</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/MisSolicitudes">Mis Solicitudes</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profesor/crearCurso">Crear Curso</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/SubirProyecto">Subir Proyecto</Link>
                                </li>
                            </>
                        )}

                        {rol === 1 && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link>
                            </li>
                        )}

                        {rol === 3 && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/alumno/proyectos">Mis Proyectos</Link>
                            </li>
                        )}

                        <li className="nav-item">
                            <Link className="nav-link" to="/profesor/dashboard">Buscador</Link>
                        </li>
                    </ul>
                    
                    {/* Botón de Cerrar Sesión */}
                    <button className="btn btn-danger ms-3" onClick={logout}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
