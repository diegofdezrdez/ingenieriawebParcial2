import React from 'react';
import ReactDOM from 'react-dom/client';
import './estilos/index.css';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        //<React.StrictMode>
            <App />
        //</React.StrictMode>
    );
} else {
    console.error("No se encontró el elemento con id 'root'");
}