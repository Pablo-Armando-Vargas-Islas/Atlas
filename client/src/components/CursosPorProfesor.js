import React, { useEffect, useState } from 'react';

const CursosPorProfesor = () => {
    const [cursosPorProfesor, setCursosPorProfesor] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/cursos/por-profesor?page=${page}&limit=4`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setCursosPorProfesor(data.slice(0, 3));

                // Verificar si hay más profesores para la próxima página
                setHasMore(data.length > 3);
            } catch (error) {
                console.error('Error al obtener los cursos por profesor:', error.message);
            }
        };

        fetchData();
    }, [page]);

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Resumen de Cursos por Profesor</h3>
            <ul>
                {cursosPorProfesor.map((profesor, index) => (
                    <li key={`${profesor.nombre}-${index}`} className="admin-card-list-item">
                        {profesor.nombre}: {profesor.cantidad_cursos} cursos
                    </li>
                ))}
            </ul>
            <div className="pagination">
                <button
                    className="pagination-button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    &lt;
                </button>
                <span className="pagination-page">{page}</span>
                <button
                    className="pagination-button"
                    disabled={!hasMore}
                    onClick={() => setPage(page + 1)}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default CursosPorProfesor;
