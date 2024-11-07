import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/VerProyectoSolicitado.css';

const VerProyectosMasSolicitados = () => {
    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(null); // Track loading status for each project
    const [showFullFields, setShowFullFields] = useState({}); // Estado para controlar qué campos muestran la descripción completa
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/metricas/proyectos/mas-solicitados', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Error al obtener los detalles de los proyectos más solicitados.');
                }
                const data = await response.json();
                setProyectos(data);
            } catch (error) {
                console.error('Error al obtener los detalles de los proyectos:', error.message);
            }
        };

        fetchProyectos();
    }, []);

    const handleGoBack = () => {
        navigate(-1); // Regresar a la vista anterior
    };

    const handleDownload = async (id) => {
        setIsLoading(id);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token no encontrado. Por favor, inicia sesión nuevamente.');
                setIsLoading(null);
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/admin/descargar/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob' // Importante para manejar archivos binarios
            });

            // Crear un enlace temporal para descargar el archivo con el nombre correcto
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'proyecto.zip'; // Valor predeterminado

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch.length > 1) {
                    fileName = fileNameMatch[1];
                }
            }

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            alert('Error al descargar el archivo. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(null);
        }
    };

    const toggleField = (id, field) => {
        setShowFullFields((prevState) => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                [field]: !prevState[id]?.[field],
            },
        }));
    };

    return (
        <div className="ver-proyectos-curso-container">
            <div className="gestion-cursos-main-content">
                <div className="navegar-atras" onClick={handleGoBack}>
                    <FaArrowLeft className="icono-navegar-atras" /> Volver
                </div>
                <h1 className="text-center my-4">Proyectos Más Solicitados</h1>
                {proyectos.length > 0 ? (
                    <Table responsive bordered hover className="gestion-cursos-table mt-4">
                        <thead>
                            <tr>
                                <th className="text-center">Título del Proyecto</th>
                                <th className="text-center">Descripción</th>
                                <th className="text-center">Autores</th>
                                <th className="text-center">Tecnologías</th>
                                <th className="text-center">Categorías</th>
                                <th className="text-center">Fecha de Creación</th>
                                <th className="text-center">Tipo de Proyecto</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map((proyecto) => (
                                <tr key={proyecto.id}>
                                    <td className="text-center">{proyecto.titulo}</td>
                                    <td className="text-center">
                                        {showFullFields[proyecto.id]?.descripcion
                                            ? proyecto.descripcion
                                            : proyecto.descripcion.length > 50
                                                ? `${proyecto.descripcion.substring(0, 50)}...`
                                                : proyecto.descripcion}
                                        {proyecto.descripcion.length > 50 && (
                                            <Button
                                                variant="link"
                                                onClick={() => toggleField(proyecto.id, 'descripcion')}
                                                className="toggle-field-btn"
                                            >
                                                {showFullFields[proyecto.id]?.descripcion ? (
                                                    <FaChevronUp />
                                                ) : (
                                                    <FaChevronDown />
                                                )}
                                            </Button>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {showFullFields[proyecto.id]?.autores
                                            ? proyecto.autores?.join(', ')
                                            : proyecto.autores?.length > 2
                                                ? `${proyecto.autores.slice(0, 2).join(', ')}...`
                                                : proyecto.autores?.join(', ')}
                                        {proyecto.autores?.length > 2 && (
                                            <Button
                                                variant="link"
                                                onClick={() => toggleField(proyecto.id, 'autores')}
                                                className="toggle-field-btn"
                                            >
                                                {showFullFields[proyecto.id]?.autores ? (
                                                    <FaChevronUp />
                                                ) : (
                                                    <FaChevronDown />
                                                )}
                                            </Button>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {showFullFields[proyecto.id]?.tecnologias
                                            ? proyecto.tecnologias?.join(', ')
                                            : proyecto.tecnologias?.length > 2
                                                ? `${proyecto.tecnologias.slice(0, 2).join(', ')}...`
                                                : proyecto.tecnologias?.join(', ')}
                                        {proyecto.tecnologias?.length > 2 && (
                                            <Button
                                                variant="link"
                                                onClick={() => toggleField(proyecto.id, 'tecnologias')}
                                                className="toggle-field-btn"
                                            >
                                                {showFullFields[proyecto.id]?.tecnologias ? (
                                                    <FaChevronUp />
                                                ) : (
                                                    <FaChevronDown />
                                                )}
                                            </Button>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {showFullFields[proyecto.id]?.categorias
                                            ? proyecto.categorias?.join(', ')
                                            : proyecto.categorias?.length > 2
                                                ? `${proyecto.categorias.slice(0, 2).join(', ')}...`
                                                : proyecto.categorias?.join(', ')}
                                        {proyecto.categorias?.length > 2 && (
                                            <Button
                                                variant="link"
                                                onClick={() => toggleField(proyecto.id, 'categorias')}
                                                className="toggle-field-btn"
                                            >
                                                {showFullFields[proyecto.id]?.categorias ? (
                                                    <FaChevronUp />
                                                ) : (
                                                    <FaChevronDown />
                                                )}
                                            </Button>
                                        )}
                                    </td>
                                    <td className="text-center">{new Date(proyecto.fecha_hora).toLocaleDateString()}</td>
                                    <td className="text-center">{proyecto.tipo}</td>
                                    <td className="text-center">
                                        <Button
                                            variant="link"
                                            onClick={() => handleDownload(proyecto.id)}
                                            disabled={isLoading === proyecto.id}
                                            className="descargar-archivo-btn"
                                        >
                                            {isLoading === proyecto.id ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <FaDownload />
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-center">Cargando detalles de los proyectos...</p>
                )}
            </div>
        </div>
    );
};

export default VerProyectosMasSolicitados;
