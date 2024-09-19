import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import DashboardProfesor from "./components/profesor/DashboardProfesor";
import SubirProyectoProfesor from "./components/profesor/SubirProyectoProfesor";
import DashboardAdmin from "./components/admin/DashboardAdmin";
import GestionUsuarios from "./components/admin/GestionUsuarios";
import DashboardAlumno from "./components/alumno/DashboardAlumno";
import MisProyectos from "./components/alumno/MisProyectos";
import CrearCursoProfesor from './components/profesor/cursos/CrearCursoProfesor';
import GestionCursosProfesor from './components/profesor/cursos/GestionCursosProfesor';
import VerProyectosCurso from './components/profesor/cursos/VerProyectosCurso';



function App() {
    return (
        <Router>
            <AuthProvider>
                <div>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Rutas de Admin */}
                        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                        <Route path="/admin/gestion" element={<GestionUsuarios />} />

                        {/* Rutas de Profesor */}
                        <Route path="/profesor/dashboard" element={<DashboardProfesor />} />
                        <Route path="/profesor/SubirProyectoProfesor" element={<SubirProyectoProfesor />} />
                        <Route path="/profesor/crearCurso" element={<CrearCursoProfesor />} />
                        <Route path="/profesor/cursos" element={<GestionCursosProfesor />} />
                        <Route path="/profesor/curso/:cursoId/proyectos" element={<VerProyectosCurso />} />


                        {/* Rutas de Alumno */}
                        <Route path="/alumno/dashboard" element={<DashboardAlumno />} />
                        <Route path="/alumno/proyectos" element={<MisProyectos />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
