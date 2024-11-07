import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardAdmin.css';

const CursosPorProfesor = () => {
    const [profesores, setProfesores] = useState([]);
    const [cara, setCara] = useState('mas'); // Estado para controlar la cara de la tarjeta
    const API_URL = 'http://localhost:5000/api/metricas';
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfesores = async () => {
            try {
                const endpoint = cara === 'mas' ? '/cursos/profesores/mas' : '/cursos/profesores/menos';
                const response = await fetch(`${API_URL}${endpoint}`, {
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

    // Manejar el clic en la tarjeta para redirigir a la vista correspondiente
    const handleCardClick = () => {
        navigate('/admin/profesor-mas-cursos');
    };

    // Cambiar entre "más cursos" y "menos cursos"
    const toggleCara = (e) => {
        e.stopPropagation(); // Evitar que el clic en el botón propague el evento al contenedor
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
