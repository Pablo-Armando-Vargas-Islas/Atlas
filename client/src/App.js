import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import DashboardProfesor from "./components/profesor/DashboardProfesor";
import SubirProyectoProfesor from "./components/profesor/SubirProyectoProfesor";
import DashboardAdmin from "./components/admin/DashboardAdmin";
import GestionUsuarios from "./components/admin/GestionUsuarios";
import DashboardAlumno from "./components/alumno/DashboardAlumno";
import MisProyectos from "./components/alumno/MisProyectos";

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
