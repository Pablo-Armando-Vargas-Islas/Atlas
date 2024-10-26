import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from '../src/routes/ProtectedRoute';
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./views/Login";
import Register from "./views/Register";
import Buscador from "./views/Buscador";
import BusquedaGlobal from "./components/buscador/BusquedaGlobal"
import SubirProyecto from "./views/SubirProyecto";
import DashboardAdministrador from "./components/admin/DashboardAdmin";
import Solicitudes from "./components/admin/Solicitudes";
import NavegarPorTitulo from "./components/buscador/NavegarPorTitulo";
import NavegarPorAutor from "./components/buscador/NavegarPorAutor";
import NavegarPorCategoria from "./components/buscador/NavegarPorCategoria";
import NavegarPorFecha from "./components/buscador/NavegarPorFecha";
import NavegarPorCurso from "./components/buscador/NavegarPorCurso";
import MisProyectos from "./components/buscador/MisProyectos";
import CrearCursoProfesor from './components/profesor/cursos/CrearCursoProfesor';
import GestionCursosProfesor from './components/profesor/cursos/GestionCursosProfesor';
import VerProyectosCurso from './components/profesor/cursos/VerProyectosCurso';
import MisSolicitudes from "./views/MisSolicitudes";
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
    const { token } = useContext(AuthContext); // Obtén el token del contexto de autenticación

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
                
                {/* Repite la lógica para cada ruta protegida */}
            </Routes>
        </>
    );
}

export default App;
