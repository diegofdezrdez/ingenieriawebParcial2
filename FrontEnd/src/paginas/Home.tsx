import React, { useState, useEffect } from 'react';
import { useAuth } from '../contextos/AuthContext';
import ControlAcceso from '../componentes/ControlAcceso';
import Boton from "../componentes/Boton";
import CrearElementoPopUp from '../componentes/PopUp/CrearElementoPopUp';
import { listarParcial2, eliminarParcial2 } from "../services/servicesParcial2"; 
import { Parcial2Respuesta } from "../esquemas/esquemas";
import '../estilos/Home.css';

const Home = () => {
    const { user } = useAuth();
    
    // Estados para la lógica
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [elementoAEditar, setElementoAEditar] = useState<Parcial2Respuesta | null>(null);
    const [elementos, setElementos] = useState<Parcial2Respuesta[]>([]);
    const [cargando, setCargando] = useState(false);

    // --- 1. FUNCIÓN PARA CARGAR DATOS DEL BACKEND ---
    const cargarDatos = async () => {
        if (!user?.uid) return;
        setCargando(true);
        // Pedimos al backend solo los elementos de este usuario
        const datos = await listarParcial2({ usuarioId: user.uid });
        if (datos) {
            setElementos(datos);
        }
        setCargando(false);
    };

    // --- 2. EFECTO: Se ejecuta al entrar a la página ---
    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Manejadores de los botones
    const handleAbrirCrear = () => {
        setElementoAEditar(null);
        setMostrarPopup(true);
    };

    const handleAbrirEditar = (item: Parcial2Respuesta) => {
        setElementoAEditar(item);
        setMostrarPopup(true);
    };

    const handleBorrar = async (id: string) => {
        if (!window.confirm("¿Seguro que quieres borrar este elemento?")) return;
        const exito = await eliminarParcial2(id);
        if (exito) cargarDatos(); // Recargamos la lista si se borró bien
    };

    return (
        <div className="home-layout">
            {/* BARRA SUPERIOR */}
            <div className="home-topbar">
                <div className="topbar-logo">Kalendas</div>
                <div className="topbar-perfil">
                    <ControlAcceso />
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="home-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Mis Elementos</h1>
                    <Boton onClick={handleAbrirCrear}>
                        + Añadir Elemento
                    </Boton>
                </div>

                {/* --- AQUÍ ESTÁ LA REJILLA DE ELEMENTOS --- */}
                {cargando ? (
                    <p>Cargando elementos...</p>
                ) : elementos.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>No tienes elementos creados aún.</p>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Rejilla responsive
                        gap: '20px' 
                    }}>
                        {elementos.map((item) => (
                            <div key={item._id} style={{ 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '12px', 
                                overflow: 'hidden', 
                                background: 'white', 
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                
                                {/* 1. ZONA DE FOTO (Parte superior de la tarjeta) */}
                                <div style={{ 
                                    width: '100%', 
                                    height: '180px', 
                                    backgroundColor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.enlaces && item.enlaces.length > 0 ? (
                                        <img 
                                            src={item.enlaces[0]} 
                                            alt={item.nombre} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <span style={{ color: '#aaa', fontSize: '2rem' }}>📷</span>
                                    )}
                                </div>

                                {/* 2. ZONA DE INFORMACIÓN (Parte inferior) */}
                                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    
                                    {/* Nombre */}
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>
                                        {item.nombre}
                                    </h3>
                                    
                                    {/* Fecha formateada */}
                                    <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#777' }}>
                                        {new Date(item.fecha).toLocaleDateString()}
                                    </p>

                                    {/* Botones de acción (Editar / Borrar) */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                        <button 
                                            onClick={() => handleAbrirEditar(item)}
                                            style={{ 
                                                flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #007bff', 
                                                background: 'white', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' 
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleBorrar(item._id)}
                                            style={{ 
                                                padding: '8px 12px', borderRadius: '6px', border: '1px solid #dc3545', 
                                                background: 'white', color: '#dc3545', cursor: 'pointer' 
                                            }}
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* POPUP (Para Crear y Editar) */}
            {mostrarPopup && (
                <CrearElementoPopUp 
                    onClose={() => setMostrarPopup(false)} 
                    onRecargar={cargarDatos}
                    elementoAEditar={elementoAEditar}
                />
            )}
        </div>
    );
};

export default Home;