import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UsuariosRegistrados = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/usuarios/total`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                setUsuarios(data);
            } catch (error) {
                console.error('Error al obtener los usuarios registrados:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Link to="/admin/usuarios" className="admin-card-link">
            <div className="admin-card">
                <h3 className="admin-card-title">Usuarios</h3>
                <ul>
                    {usuarios.map((usuario, index) => (
                        <li key={index}>{usuario.rol}: {usuario.cantidad}</li>
                    ))}
                </ul>
            </div>
        </Link>
    );
};

export default UsuariosRegistrados;
