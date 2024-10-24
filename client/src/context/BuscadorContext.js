import React, { createContext, useState, useContext } from 'react';

const BuscadorContext = createContext();

// Proveedor de contexto del buscador
export const BuscadorProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [filtros, setFiltros] = useState({});
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para realizar la búsqueda
  const buscarProyectos = async (consulta) => {
    setLoading(true);
    setQuery(consulta);
    try {
      const token = localStorage.getItem('token'); // Obtener el token para autenticación
      if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia sesión nuevamente.");
      }

      const response = await fetch(
        `http://localhost:5000/api/proyectos/atlas?query=${encodeURIComponent(consulta)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResultados(data);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BuscadorContext.Provider
      value={{ query, filtros, resultados, loading, buscarProyectos, setFiltros }}
    >
      {children}
    </BuscadorContext.Provider>
  );
};

// Hook personalizado para usar el contexto del buscador
export const useBuscador = () => {
  return useContext(BuscadorContext);
};
