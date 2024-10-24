import React from 'react';
import { createRoot } from 'react-dom/client'; // Importa createRoot desde react-dom/client
import App from './App';
import { BuscadorProvider } from './context/BuscadorContext'; // Importar el contexto del buscador
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container); // Crear el root

root.render(
  <BuscadorProvider>
    <App />
  </BuscadorProvider>
);