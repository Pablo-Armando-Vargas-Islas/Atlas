import React from 'react';
import axios from 'axios';

const BotonDescarga = ({ id }) => {
    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token no encontrado. Por favor, inicia sesión nuevamente.');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/solicitudes/descargar/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob' // Importante para manejar archivos binarios
            });

            // Crear un enlace temporal para descargar el archivo con el nombre correcto
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'archivo.zip'; // Valor predeterminado

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
        }
    };

    return (
        <button onClick={handleDownload} className="btn btn-primary">
            Descargar Archivo
        </button>
    );
};

export default BotonDescarga;
