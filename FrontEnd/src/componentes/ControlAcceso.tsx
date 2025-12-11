// ======================================================================
// ========================= IMPORTS ====================================
// ======================================================================
import React from "react";
import { useAuth } from "../contextos/AuthContext"; 
import { useNavigate } from "react-router-dom";

// ======================================================================
// ========================== COMPONENTE ================================
// ======================================================================
const ControlAcceso: React.FC = () => {
    
    const { 
        user, 
        loading, 
        signInWithGoogle, 
        signInWithGithub, 
        logOut 
    } = useAuth();

    const navigate = useNavigate(); // 2. Hook de navegación

    // --- FUNCIÓN CERRAR SESIÓN CON REDIRECCIÓN ---
    const handleLogout = async () => {
        await logOut();
        navigate("/"); // Redirige a la raíz (login)
    };

    if (loading) {
        return <div className="control-acceso-loading">Cargando...</div>;
    }

    // --- VISTA: NO LOGUEADO (FORMULARIO) ---
    if (!user) {
        return (
            <div className="control-acceso-container">
                <h2 className="control-acceso-titulo">Iniciar Sesión</h2>
                
                {/* --- CAMPOS DE TEXTO VISUALES --- */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", textAlign: "left" }}>
                    <div>
                        <label style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#555" }}>Usuario / Email</label>
                        <input 
                            type="text" 
                            placeholder="ejemplo@correo.com" 
                            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginTop: "5px" }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#555" }}>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginTop: "5px" }}
                        />
                    </div>
                    <button className="boton-primario" style={{ marginTop: "10px", backgroundColor: "#007bff", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        Entrar
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
                    <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
                    <span style={{ padding: "0 10px", color: "#888", fontSize: "0.9rem" }}>O continúa con</span>
                    <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
                </div>
                
                <div className="control-acceso-botones" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button onClick={signInWithGoogle} className="btn-google" style={{ padding: "10px", cursor: "pointer" }}>
                        Google
                    </button>

                    <button onClick={signInWithGithub} className="btn-github" style={{ padding: "10px", cursor: "pointer" }}>
                        GitHub
                    </button>
                </div>
            </div>
        );
    }

    // --- VISTA: USUARIO LOGUEADO ---
    return (
        <div className="perfil-container" style={{ textAlign: "center" }}>
            <div className="perfil-info">
                {user.photoURL && (
                    <img 
                        src={user.photoURL} 
                        alt="Perfil" 
                        className="perfil-avatar"
                        style={{ width: "80px", borderRadius: "50%", marginBottom: "10px" }}
                    />
                )}
                <div className="perfil-datos">
                    <h3 className="perfil-nombre">{user.displayName || "Usuario"}</h3>
                    <p className="perfil-email">{user.email}</p>
                </div>
            </div>

            <button 
                onClick={handleLogout} // Usamos la nueva función
                className="btn-logout"
                style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
                Cerrar Sesión
            </button>
        </div>
    );

    
};

export default ControlAcceso;