import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./paginas/Inicio";
// 1. Importar la nueva página
import Home from "./paginas/Home"; 
import { AuthProvider } from "./contextos/AuthContext";

const AppContent: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Inicio />} />
            {/* 2. Añadir la nueva ruta */}
            <Route path="/home" element={<Home />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;