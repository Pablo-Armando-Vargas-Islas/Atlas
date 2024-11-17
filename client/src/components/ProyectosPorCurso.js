import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardAdmin.css';

const API_URL = 'http://localhost:5000';

const ProyectosPorCurso = () => {
    const [cursos, setCursos] = useState([]);
    const [cara, setCara] = useState('mas');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const endpoint = cara === 'mas' ? '/cursos/mas-proyectos' : '/cursos/menos-proyectos';
                const response = await fetch(`${API_URL}/api/metricas${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setCursos(data);
            } catch (error) {
                console.error('Error al obtener los cursos:', error.message);
            }
        };

        fetchCursos();
    }, [cara]);

    const handleCardClick = () => {
        navigate('/admin/proyectos-mas-cursos');
    };

    const toggleCara = (e) => {
        e.stopPropagation();
        setCara((prevCara) => (prevCara === 'mas' ? 'menos' : 'mas'));
    };

    return (
        <div className="admin-card clickeable" onClick={handleCardClick}>
            <h3 className="admin-card-title">
                {cara === 'mas' ? 'Cursos con más proyectos' : 'Cursos con menos proyectos'}
            </h3>
            <ul className="profesores-list">
                {cursos.map((curso, index) => (
                    <li key={index} className="profesores-list-item">
                        {curso.nombre_curso}: {curso.cantidad_proyectos} proyectos
                    </li>
                ))}
            </ul>
            <div className="pagination">
                <button className="pagination-button" onClick={toggleCara}>
                    {cara === 'mas' ? '>' : '<'}
                </button>
            </div>
        </div>
    );
};

export default ProyectosPorCurso;
