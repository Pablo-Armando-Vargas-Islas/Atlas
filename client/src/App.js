import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from '../src/routes/ProtectedRoute';
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import DashboardProfesor from "./components/profesor/DashboardProfesor";
import SubirProyecto from "./components/SubirProyecto";
import DashboardAdmin from "./components/admin/DashboardAdmin";
//import DashboardAlumno from "./components/alumno/DashboardAlumno";
import MisProyectos from "./components/alumno/MisProyectos";
import CrearCursoProfesor from './components/profesor/cursos/CrearCursoProfesor';
import GestionCursosProfesor from './components/profesor/cursos/GestionCursosProfesor';
import VerProyectosCurso from './components/profesor/cursos/VerProyectosCurso';
import MisSolicitudes from "./components/MisSolicitudes";
import Navbar from "./components/Navbar";

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
                        token ? <Navigate to="/profesor/dashboard" /> : <Navigate to="/login" />
                    }
                />

                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas protegidas */}
                <Route
                    path="/profesor/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardProfesor />
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
                    path="/admin/DashboardAdmin"
                    element={
                        <ProtectedRoute>
                            <DashboardAdmin />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/MisProyectos"
                    element={
                        <ProtectedRoute>
                            <MisProyectos />
                        </ProtectedRoute>
                    }
                />
                {/* Repite la lógica para cada ruta protegida */}
            </Routes>
        </>
    );
}

export default App;
