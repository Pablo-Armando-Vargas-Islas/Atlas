import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardAdmin.css';

const API_URL = 'http://localhost:5000';

const CursosPorProfesor = () => {
    const [profesores, setProfesores] = useState([]);
    const [cara, setCara] = useState('mas');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfesores = async () => {
            try {
                const endpoint = cara === 'mas' ? '/cursos/profesores/mas' : '/cursos/profesores/menos';
                const response = await fetch(`${API_URL}/api/metricas${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setProfesores(data);
            } catch (error) {
                console.error('Error al obtener los profesores:', error.message);
            }
        };

        fetchProfesores();
    }, [cara]);

    const handleCardClick = () => {
        navigate('/admin/profesor-mas-cursos');
    };

    const toggleCara = (e) => {
        e.stopPropagation();
        setCara((prevCara) => (prevCara === 'mas' ? 'menos' : 'mas'));
    };

    return (
        <div className="admin-card clickeable" onClick={handleCardClick}>
            <h3 className="admin-card-title">
                {cara === 'mas' ? 'Profesores con más cursos' : 'Profesores con menos cursos'}
            </h3>
            <ul className="profesores-list">
                {profesores.map((profesor, index) => (
                    <li key={index} className="profesores-list-item">
                        {profesor.nombre}: {profesor.cantidad_cursos} cursos
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

export default CursosPorProfesor;
