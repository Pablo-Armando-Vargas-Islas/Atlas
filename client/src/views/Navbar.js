import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../styles/logo-retina5.png'; // Imagen del logo

const Navbar = () => {
    const { rol, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isLoginPage = location.pathname === '/login';
    const isSignUpPage = location.pathname === '/signup';

    // Función para alternar el estado del menú hamburguesa
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Función para cerrar el menú si la pantalla es pequeña
    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setMenuOpen(false);
        }
    };

    // Escuchar cambios de tamaño de la ventana y cerrar el menú si se expande a una pantalla grande
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        // Limpieza del listener al desmontar el componente
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Cerrar el menú automáticamente cuando cambia la ruta en pantallas pequeñas
    useEffect(() => {
        if (window.innerWidth < 768) {
            setMenuOpen(false);
        }
    }, [location]);

    // Función para cerrar sesión y cerrar el menú
    const handleLogout = () => {
        logout();
        if (window.innerWidth < 768) {
            setMenuOpen(false);
        };
    };

    return (
        <nav className="custom-navbar">
            <div className="navbar-container">
                {/* Cambiar el título "ATLAS" por la imagen del logo */}
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <img src={logo} alt="Logo ATLAS" className="navbar-logo-image" />
                </div>
                
                {token && (
                    <div className="menu-icon" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </div>
                )}

                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    {rol === 2 && (
                        <>
                            <Link className="nav-link" to="/SubirProyecto" onClick={handleLinkClick}>Subir Proyecto</Link>
                            <Link className="nav-link" to="/profesor/cursos" onClick={handleLinkClick}>Mis Cursos</Link>
                            <Link className="nav-link" to="/MisSolicitudes" onClick={handleLinkClick}>Mis Solicitudes</Link>
                            <Link className="nav-link" to="/Perfil" onClick={handleLinkClick}>Mis Datos</Link>
                            <Link className="nav-link" to="/Buscador" onClick={handleLinkClick}>Buscador</Link>
                        </>
                    )}

                    {rol === 1 && (
                        <>  
                            <Link className="nav-link" to="/admin/configuración" onClick={handleLinkClick}>Configuración</Link>
                            <Link className="nav-link" to="/admin/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                            <Link className="nav-link" to="/SubirProyecto" onClick={handleLinkClick}>Subir Proyecto</Link>
                            <Link className="nav-link" to="/profesor/cursos" onClick={handleLinkClick}>Mis Cursos</Link>
                            <Link className="nav-link" to="/Perfil" onClick={handleLinkClick}>Mi Datos</Link>
                            <Link className="nav-link" to="/Buscador" onClick={handleLinkClick}>Buscador</Link>
                        </>
                    )}

                    {rol === 3 && (
                        <>
                            <Link className="nav-link" to="/SubirProyecto" onClick={handleLinkClick}>Subir Proyecto</Link>
                            <Link className="nav-link" to="/MisSolicitudes" onClick={handleLinkClick}>Mis Solicitudes</Link>
                            <Link className="nav-link" to="/alumno/mis-cursos" onClick={handleLinkClick}>Mis cursos</Link>
                            <Link className="nav-link" to="/Perfil" onClick={handleLinkClick}>Mis Datos</Link>
                            <Link className="nav-link" to="/Buscador" onClick={handleLinkClick}>Buscador</Link>
                        </>
                    )}

                    {token && menuOpen && (
                        <button className="btn btn-logout nav-link" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    )}
                </div>

                {token && !menuOpen && (
                    <div className="logout-button">
                        <button className="btn btn-logout" onClick={logout}>
                            Cerrar Sesión
                        </button>
                    </div>
                )}

                {!token && (
                    <div className="auth-buttons">
                        <button
                            className={`btn ${isLoginPage ? 'btn-primary' : 'btn-outline-primary'} btn-login`}
                            onClick={() => navigate('/login')}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            className={`btn ${isSignUpPage ? 'btn-primary' : 'btn-outline-primary'} btn-signup`}
                            onClick={() => navigate('/signup')}
                        >
                            Regístrate
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
