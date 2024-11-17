import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const CursosActivosVsCerrados = () => {
    const [cursos, setCursos] = useState({ abiertos: 0, cerrados: 0 });

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/metricas/cursos/estado`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Error en la autenticación o en la solicitud');
                }
                const data = await response.json();
                const result = data.reduce((acc, curso) => {
                    if (curso.estado === 'abierto') {
                        acc.abiertos += curso.cantidad;
                    } else if (curso.estado === 'cerrado') {
                        acc.cerrados += curso.cantidad;
                    }
                    return acc;
                }, { abiertos: 0, cerrados: 0 });
                setCursos(result);
            } catch (error) {
                console.error('Error al obtener cursos:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Link to="/admin/cursos" className="admin-card-link">
            <div className="admin-card">
                <h3 className="admin-card-title">Cursos</h3>
                <ul>
                    <li>Activos: {cursos.abiertos}</li>
                    <li>Cerrados: {cursos.cerrados}</li>
                </ul>
            </div>
        </Link>
    );
};

export default CursosActivosVsCerrados;
