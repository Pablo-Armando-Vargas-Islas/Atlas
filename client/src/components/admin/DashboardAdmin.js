import React, { useEffect, useState } from 'react';
import '../../styles/DashboardAdmin.css';

const DashboardAdministrador = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cursos, setCursos] = useState({ abiertos: 0, cerrados: 0 });
    const [proyectos, setProyectos] = useState([]);
    const [solicitudes, setSolicitudes] = useState(0);
    
    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token'); // Asume que el token está almacenado en localStorage
    
        // Obtener el total de usuarios
        fetch(`${API_URL}/usuarios/total`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                return response.json();
            })
            .then(data => setUsuarios(data))
            .catch(error => console.error('Error al obtener usuarios:', error));
    
        // Obtener el estado de los cursos
        fetch(`${API_URL}/cursos/estado`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                return response.json();
            })
            .then(data => {
                const abiertos = data.find(curso => curso.estado === 'abierto')?.cantidad || 0;
                const cerrados = data.find(curso => curso.estado === 'cerrado')?.cantidad || 0;
                setCursos({ abiertos, cerrados });
            })
            .catch(error => console.error('Error al obtener cursos:', error));
    
        // Obtener el total de proyectos entregados
        fetch(`${API_URL}/proyectos/total`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                return response.json();
            })
            .then(data => setProyectos(data))
            .catch(error => console.error('Error al obtener proyectos:', error));
    
        // Obtener el total de solicitudes pendientes
        fetch(`${API_URL}/solicitudes/pendientes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                return response.json();
            })
            .then(data => setSolicitudes(data.cantidad))
            .catch(error => console.error('Error al obtener solicitudes pendientes:', error));
    }, []);
    

    return (
        <div className="admin-dashboard-container">
            <h2 className="admin-dashboard-title">Dashboard del Administrador</h2>
            <div className="admin-metricas-generales">
                <div className="admin-card">
                    <h3 className="admin-card-title">Usuarios Registrados</h3>
                    <ul>
                        {usuarios.map(usuario => (
                            <li key={usuario.rol} className="admin-card-list-item">
                                {usuario.rol}: {usuario.cantidad}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="admin-card">
                    <h3 className="admin-card-title">Cursos Activos vs Cerrados</h3>
                    <p className="admin-card-text">Activos: {cursos.abiertos}</p>
                    <p className="admin-card-text">Cerrados: {cursos.cerrados}</p>
                </div>
                <div className="admin-card">
                    <h3 className="admin-card-title">Proyectos Entregados</h3>
                    <ul>
                        {proyectos.map(proyecto => (
                            <li key={proyecto.tipo_proyecto} className="admin-card-list-item">
                                {proyecto.tipo_proyecto}: {proyecto.cantidad}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="admin-card">
                    <h3 className="admin-card-title">Solicitudes Pendientes</h3>
                    <p className="admin-card-text">{solicitudes}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdministrador;
