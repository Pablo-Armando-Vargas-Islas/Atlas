import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './styles/Navbar.css';

const Navbar = () => {
    const { rol, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isLoginPage = location.pathname === '/login';
    const isSignUpPage = location.pathname === '/register';

    return (
        <nav className="custom-navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')}>ATLAS</div>
                <div className="navbar-links">
                    {rol === 2 && (
                        <>
                            <Link className="nav-link" to="/profesor/cursos">Mis Cursos</Link>
                            <Link className="nav-link" to="/MisSolicitudes">Mis Solicitudes</Link>
                            <Link className="nav-link" to="/profesor/crearCurso">Crear Curso</Link>
                            <Link className="nav-link" to="/SubirProyecto">Subir Proyecto</Link>
                            <Link className="nav-link" to="/profesor/dashboard">Buscador</Link>
                        </>
                    )}

                    {rol === 1 && (
                        <>
                            <Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link>
                            <Link className="nav-link" to="/profesor/dashboard">Buscador</Link>
                        </>
                    )}

                    {rol === 3 && (
                        <>
                            <Link className="nav-link" to="/alumno/proyectos">Mis Proyectos</Link>
                            <Link className="nav-link" to="/profesor/dashboard">Buscador</Link>
                        </>
                    )}
                </div>
                <div className="auth-buttons">
                    {!token ? (
                        <>
                            <button
                                className={`btn ${isLoginPage ? 'btn-primary' : 'btn-outline-primary'} btn-login`}
                                onClick={() => navigate('/login')}
                            >
                                Log in
                            </button>
                            <button
                                className={`btn ${isSignUpPage ? 'btn-primary' : 'btn-outline-primary'} btn-signup`}
                                onClick={() => navigate('/register')}
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-logout" onClick={logout}>
                            Cerrar Sesión
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
