import React from "react";
import "../estilos/Boton.css"; // Importamos los estilos que acabamos de crear

interface BotonProps {
    children: React.ReactNode; // El texto o iconos de dentro
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
    disabled?: boolean;
    type?: "button" | "submit";
    // Tipos visuales que soporta nuestro CSS
    tipo?: "primario" | "mini-rojo"; 
    className?: string;
}

const Boton: React.FC<BotonProps> = ({
    children,
    onClick,
    disabled = false,
    type = "button",
    tipo = "primario", // Por defecto es azul
    className = "",
}) => {
    return (
        <button
            className={`boton boton-${tipo} ${disabled ? "boton-disabled" : ""} ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </button>
    );
};

export default Boton;