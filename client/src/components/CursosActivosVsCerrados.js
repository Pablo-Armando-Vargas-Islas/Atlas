import React, { useEffect, useState } from 'react';

const CursosActivosVsCerrados = () => {
    const [cursos, setCursos] = useState({ abiertos: 0, cerrados: 0 });

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/cursos/estado`, {
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
        <div className="admin-card">
            <h3 className="admin-card-title">Cursos Activos vs Cerrados</h3>
            <p className="admin-card-text">Activos: {cursos.abiertos}</p>
            <p className="admin-card-text">Cerrados: {cursos.cerrados}</p>
        </div>
    );
};

export default CursosActivosVsCerrados;
