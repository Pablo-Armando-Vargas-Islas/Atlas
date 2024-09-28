import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import DashboardProfesor from "./components/profesor/DashboardProfesor";
import SubirProyectoProfesor from "./components/profesor/SubirProyectoProfesor";
import DashboardAdmin from "./components/admin/DashboardAdmin";
import DashboardAlumno from "./components/alumno/DashboardAlumno";
import MisProyectos from "./components/alumno/MisProyectos";
import CrearCursoProfesor from './components/profesor/cursos/CrearCursoProfesor';
import GestionCursosProfesor from './components/profesor/cursos/GestionCursosProfesor';
import VerProyectosCurso from './components/profesor/cursos/VerProyectosCurso';
import MisSolicitudes from "./components/profesor/MisSolicitudes";
import Navbar from "./components/Navbar"; // Importa el nuevo componente de Navbar

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

// Componente separado que contiene el hook useLocation
function AppContent() {
    // Hook para obtener la ruta actual
    const location = useLocation();

    // Lista de rutas donde no se debe mostrar el Navbar
    const noNavbarRoutes = ["/", "/register"];

    return (
        <div>
            {/* Mostrar el Navbar solo si la ruta actual no está en la lista noNavbarRoutes */}
            {!noNavbarRoutes.includes(location.pathname) && <Navbar />}
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas de Admin */}
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />

                {/* Rutas de Profesor */}
                <Route path="/profesor/dashboard" element={<DashboardProfesor />} />
                <Route path="/profesor/SubirProyectoProfesor" element={<SubirProyectoProfesor />} />
                <Route path="/profesor/crearCurso" element={<CrearCursoProfesor />} />
                <Route path="/profesor/cursos" element={<GestionCursosProfesor />} />
                <Route path="/profesor/curso/:cursoId/proyectos" element={<VerProyectosCurso />} />
                <Route path="/profesor/misSolicitudes" element={<MisSolicitudes />} />

                {/* Rutas de Alumno */}
                <Route path="/alumno/dashboard" element={<DashboardAlumno />} />
                <Route path="/alumno/proyectos" element={<MisProyectos />} />
            </Routes>
        </div>
    );
}

export default App;
