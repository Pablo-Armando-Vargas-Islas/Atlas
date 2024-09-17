import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import DashboardProfesor from "./components/profesor/DashboardProfesor";
import SubirProyectoProfesor from "./components/profesor/SubirProyectoProfesor";

function App() {
    return (
        <Router>
            <AuthProvider>
                <div>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Rutas sin protección */}
                        <Route path="/home" element={<Home />} />
                        <Route path="/profesor/dashboard" element={<DashboardProfesor />} />
                        <Route path="/profesor/SubirProyectoProfesor" element={<SubirProyectoProfesor />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;