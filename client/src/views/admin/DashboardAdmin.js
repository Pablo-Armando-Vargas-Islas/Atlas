import React from 'react';
import '../../styles/DashboardAdmin.css';
import UsuariosRegistrados from '../../components/UsuariosRegistrados';
import CursosActivosVsCerrados from '../../components/CursosActivosVsCerrados';
import ProyectosEntregados from '../../components/ProyectosEntregados';
import SolicitudesPendientes from '../../components/SolicitudesPendientes';
import EstadoSolicitudes from '../../components/EstadoSolicitudes';
import ActividadReciente from '../../components/ActividadReciente';
import EstudiantesActivos from '../../components/EstudiantesActivos';
import ProfesoresActivos from '../../components/ProfesoresActivos';
import ProyectosMasSolicitados from '../../components/ProyectosMasSolicitados';
import CursosPorProfesor from '../../components/CursosPorProfesor';
import ProyectosPorCurso from '../../components/ProyectosPorCurso';
import AlertasYNotificaciones from '../../components/AlertasYNotificaciones';

const DashboardAdministrador = () => {
    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-box">
                <h2 className="text-center mb-4">Dashboard del Administrador</h2>
                <div className="admin-metricas-generales">
                    {/* Métricas generales */}
                    <UsuariosRegistrados />
                    <CursosActivosVsCerrados />
                    <ProyectosEntregados />
                    <SolicitudesPendientes />
                    <EstudiantesActivos />
                    <ProfesoresActivos />
                    <ProyectosMasSolicitados />
                    <CursosPorProfesor />
                    <ProyectosPorCurso />
                    {/* <AlertasYNotificaciones /> */}
                </div>
                <div className="admin-graficas-container">
                    <EstadoSolicitudes />
                    <ActividadReciente />
                </div>
            </div>
        </div>
    );
};

export default DashboardAdministrador;