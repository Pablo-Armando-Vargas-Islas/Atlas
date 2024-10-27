import React, { useEffect, useState } from 'react';

const ProyectosPorCurso = () => {
    const [proyectosPorCurso, setProyectosPorCurso] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        const API_URL = 'http://localhost:5000/api/metricas';
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/proyectos/por-curso?page=${page}&limit=3`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error en la autenticación o en la solicitud. Status: ${response.status}`);
                }
                const data = await response.json();
                setProyectosPorCurso(data);

                // Se verifica si hay más cursos para la próxima página.
                setHasMore(data.length > 4);
            } catch (error) {
                console.error('Error al obtener los proyectos por curso:', error.message);
            }
        };

        fetchData();
    }, [page]);

    return (
        <div className="admin-card">
            <h3 className="admin-card-title">Proyectos Subidos por Curso</h3>
            <ul>
                {proyectosPorCurso.map((curso, index) => (
                    <li key={`${curso.nombre_curso}-${index}`} className="admin-card-list-item">
                        {curso.nombre_curso}: {curso.cantidad_proyectos} proyectos
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

export default ProyectosPorCurso;
