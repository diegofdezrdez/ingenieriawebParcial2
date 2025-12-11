import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ControlAcceso from "../componentes/ControlAcceso";
import { useAuth } from "../contextos/AuthContext";

const Inicio = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate("/home");
        }
    }, [user, loading, navigate]);

    if (loading) return <div className="login-page-container">Cargando...</div>;
    if (user) return null;

    return (
        <div className="login-page-container">
            <div className="login-card">
                {/* HE BORRADO EL H2 DE AQUÍ PARA QUE NO SALGA DOBLE */}
                <ControlAcceso />
            </div>
        </div>
    );
};

export default Inicio;