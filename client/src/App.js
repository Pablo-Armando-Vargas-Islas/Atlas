import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from '../src/routes/ProtectedRoute';
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./views/Login";
import Register from "./views/Register";
import RegisterAdmin from "./views/admin/RegisterAdmin";
import ForgotPassword from "./views/ForgotPassword";
import ChangePassword from "./views/ChangePassword";
import Buscador from "./views/Buscador";
import BusquedaGlobal from "./views/buscador/BusquedaGlobal"
import SubirProyecto from "./views/SubirProyecto";
import DashboardAdministrador from "./views/admin/DashboardAdmin";
import Solicitudes from "./views/admin/Solicitudes";
import NavegarPorTitulo from "./views/buscador/NavegarPorTitulo";
import NavegarPorAutor from "./views/buscador/NavegarPorAutor";
import NavegarPorCategoria from "./views/buscador/NavegarPorCategoria";
import NavegarPorFecha from "./views/buscador/NavegarPorFecha";
import NavegarPorCurso from "./views/buscador/NavegarPorCurso";
import MisProyectos from "./views/buscador/MisProyectos";
import CrearCursoProfesor from './views/profesor/cursos/CrearCursoProfesor';
import CrearCursoAdmin from "./views/admin/CrearCursoAdmin";
import GestionCursosProfesor from './views/profesor/cursos/GestionCursosProfesor';
import VerProyectosCurso from './views/profesor/cursos/VerProyectosCurso';
import MisSolicitudes from "./views/MisSolicitudes";
import EditarUsuarios from "./views/admin/EditarUsuarios";
import EditarCursos from "./views/admin/EditarCursos";
import ProyectosPorCurso from "./views/admin/ProyectosPorCurso";
import ConfiguracionCorreo from "./views/ConfiguracionCorreo";
import VerProyectoSolicitado from "./views/admin/VerProyectoSolicitado";
import ActividadUsuarios from "./views/admin/ActividadUsuarios"
import InactividadUsuarios from "./views/admin/InactividadUsuarios"
import ProfesorCursos from "./views/admin/ProfesorCursos"
import CursosProyectos from "./views/admin/CursosProyectos";
import GestionCursosAlumno from "./views/alumno/GestionCursosAlumno";
import VerProyectosAlumnoCurso from "./views/alumno/VerProyectosAlumnoCurso";
import ConfiguracionSistema from "./views/admin/ConfiguracionSistema";
import GestionTecnologias from "./views/admin/GestionTecnologias";
import GestionCategorias from "./views/admin/GestionCategorias";
import ConfirmarInactividadUsuarios from "./views/admin/ConfirmarInactividadUsuarios";
import EditarProyecto from "./views/admin/EditarProyecto";
import Perfil from "./views/Perfil";
import Navbar from "./views/Navbar";

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

function AppContent() {
    const { token } = useContext(AuthContext); 

    return (
        <>
            <Navbar />
            
            <Routes>

                {/* Ruta predeterminada que redirige al login si no está autenticado */}
                <Route
                    path="/"
                    element={
                        token ? <Navigate to="/Buscador" /> : <Navigate to="/login" />
                    }
                />
                
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/recuperar-contraseña" element={<ForgotPassword />} />


                {/* Rutas protegidas */}
                <Route
                    path="/Buscador"
                    element={
                        <ProtectedRoute>
                            <Buscador />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/perfil"
                    element={
                        <ProtectedRoute>
                            <Perfil />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/actualiza-contrasena"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/registrar-admin"
                    element={
                        <ProtectedRoute>
                            <RegisterAdmin />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profesor/crearCurso"
                    element={
                        <ProtectedRoute>
                            <CrearCursoProfesor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profesor/cursos"
                    element={
                        <ProtectedRoute>
                            <GestionCursosProfesor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profesor/curso/:cursoId/proyectos"
                    element={
                        <ProtectedRoute>
                            <VerProyectosCurso />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/MisSolicitudes"
                    element={
                        <ProtectedRoute>
                            <MisSolicitudes />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/SubirProyecto"
                    element={
                        <ProtectedRoute>
                            <SubirProyecto />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/solicitudes"
                    element={
                        <ProtectedRoute>
                            <Solicitudes />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardAdministrador />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/usuarios"
                    element={
                        <ProtectedRoute>
                            <EditarUsuarios />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/cursos"
                    element={
                        <ProtectedRoute>
                            <EditarCursos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/crear-curso"
                    element={
                        <ProtectedRoute>
                            <CrearCursoAdmin />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/editar-proyecto/:id"
                    element={
                        <ProtectedRoute>
                            <EditarProyecto />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/configuracion/configurar-correo"
                    element={
                        <ProtectedRoute>
                            <ConfiguracionCorreo />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/proyectos-mas-solicitados"
                    element={
                        <ProtectedRoute>
                            <VerProyectoSolicitado />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/proyectos-mas-cursos"
                    element={
                        <ProtectedRoute>
                            <CursosProyectos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/actividad-usuarios"
                    element={
                        <ProtectedRoute>
                            <ActividadUsuarios />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/usuarios-inactivos"
                    element={
                        <ProtectedRoute>
                            <InactividadUsuarios />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/profesor-mas-cursos"
                    element={
                        <ProtectedRoute>
                            <ProfesorCursos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/configuración"
                    element={
                        <ProtectedRoute>
                            <ConfiguracionSistema />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/editar/usuarios-inactivos"
                    element={
                        <ProtectedRoute>
                            <ConfirmarInactividadUsuarios />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/configuracion/editar-tecnologias"
                    element={
                        <ProtectedRoute>
                            <GestionTecnologias />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/configuracion/editar-categorias"
                    element={
                        <ProtectedRoute>
                            <GestionCategorias />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alumno/mis-cursos"
                    element={
                        <ProtectedRoute>
                            <GestionCursosAlumno />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alumno/curso/:cursoId/proyectos"
                    element={
                        <ProtectedRoute>
                            <VerProyectosAlumnoCurso />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/proyectos-curso/:id"
                    element={
                        <ProtectedRoute>
                            <ProyectosPorCurso />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/busqueda-global"
                    element={
                        <ProtectedRoute>
                            <BusquedaGlobal />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/mis-proyectos"
                    element={
                        <ProtectedRoute>
                            <MisProyectos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/navegar-por-titulo"
                    element={
                        <ProtectedRoute>
                            <NavegarPorTitulo />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/navegar-por-autor"
                    element={
                        <ProtectedRoute>
                            <NavegarPorAutor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/navegar-por-categoria"
                    element={
                        <ProtectedRoute>
                            <NavegarPorCategoria />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/navegar-por-fecha"
                    element={
                        <ProtectedRoute>
                            <NavegarPorFecha />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buscador/navegar-por-cursos"
                    element={
                        <ProtectedRoute>
                            <NavegarPorCurso />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
