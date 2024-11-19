import React, { createContext, useState, useContext } from 'react';
import API_URL from '../Server';

const BuscadorContext = createContext();

export const BuscadorProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [filtros, setFiltros] = useState({});
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarProyectos = async (consulta, orden = 'reciente') => {
    setLoading(true);
    setQuery(consulta);
    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error("Token no encontrado. Por favor, inicia sesión nuevamente.");
      }
  
      const response = await fetch(`${API_URL}/api/proyectos/atlas?query=${encodeURIComponent(consulta)}&orden=${orden}`,
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

export const useBuscador = () => {
  return useContext(BuscadorContext);
};
