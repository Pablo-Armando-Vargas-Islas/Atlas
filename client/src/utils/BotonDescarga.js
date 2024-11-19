import React, { useState } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import '../styles/ProyectoModal.css';
import API_URL from '../Server';

const BotonDescarga = ({ id }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token no encontrado. Por favor, inicia sesión nuevamente.');
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/solicitudes/descargar/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob' 
            });

            // Crear un enlace temporal para descargar el archivo con el nombre correcto
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'solicitud_proyecto.zip'; 

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
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handleDownload} className="btn-solicitar-acceso" disabled={isLoading}>
            {isLoading ? (
                <>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    /> Cargando...
                </>
            ) : (
                'Descargar Archivo'
            )}
        </button>
    );
};

export default BotonDescarga;
