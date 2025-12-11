import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contextos/AuthContext';
import ControlAcceso from '../componentes/ControlAcceso';
import Boton from "../componentes/Boton";
import CrearElementoPopUp from '../componentes/PopUp/CrearElementoPopUp';
import { listarParcial2, eliminarParcial2 } from "../services/servicesParcial2"; 
import { Parcial2Respuesta } from "../esquemas/esquemas";
import '../estilos/Home.css';

const Home = () => {
    const { user } = useAuth();
    
    // Estados
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [elementoAEditar, setElementoAEditar] = useState<Parcial2Respuesta | null>(null);
    const [elementos, setElementos] = useState<Parcial2Respuesta[]>([]);
    const [cargando, setCargando] = useState(false);

    // Filtros
    const [busqueda, setBusqueda] = useState(""); 
    const [ordenDescendente, setOrdenDescendente] = useState(true); 

    // --- FUNCIÓN DE CARGA ---
    const cargarDatos = async (filtroTexto?: string) => {
        if (!user?.uid) return;
        
        setCargando(true);
        // Si no pasamos filtroTexto (undefined) o es "", el backend debe devolver todo.
        const textoParaBackend = (!filtroTexto || filtroTexto.trim() === "") ? undefined : filtroTexto;

        try {
            const datos = await listarParcial2({ 
                usuarioId: user.uid,
                nombre: textoParaBackend
            });
            
            if (datos) {
                setElementos(datos);
            } else {
                setElementos([]);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setCargando(false);
        }
    };

    // --- EFECTO 1: Carga inicial ---
    useEffect(() => {
        cargarDatos(); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // --- EFECTO 2: Reactivar búsqueda vacía ---
    useEffect(() => {
        if (busqueda === "") {
            cargarDatos();
        }
    }, [busqueda]);

    // --- ORDENAMIENTO ---
    const elementosOrdenados = useMemo(() => {
        if (!elementos) return [];
        return [...elementos].sort((a, b) => {
            const fechaA = new Date(a.fecha).getTime();
            const fechaB = new Date(b.fecha).getTime();
            return ordenDescendente ? fechaB - fechaA : fechaA - fechaB;
        });
    }, [elementos, ordenDescendente]);

    // --- MANEJADORES ---
    const handleBuscar = () => {
        cargarDatos(busqueda);
    };

    const handleLimpiarFiltro = () => {
        setBusqueda(""); 
        // El useEffect de arriba se encargará de llamar a cargarDatos()
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleBuscar();
    };

    const handleInvertirOrden = () => setOrdenDescendente(!ordenDescendente);

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
        if (exito) cargarDatos(busqueda); 
    };

    return (
        <div className="home-layout">
            <div className="home-topbar">
                <div className="topbar-logo">Kalendas</div>
                <div className="topbar-perfil">
                    <ControlAcceso />
                </div>
            </div>

            <div className="home-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Mis Elementos</h1>
                    <Boton onClick={handleAbrirCrear}>
                        + Añadir Elemento
                    </Boton>
                </div>

                {/* --- BARRA DE FILTRADO --- */}
                {/* Solo mostramos la barra si hay elementos O si se está buscando algo */}
                {(elementos.length > 0 || busqueda !== "") && (
                    <div style={{ 
                        display: 'flex', gap: '10px', marginBottom: '20px', padding: '15px', 
                        backgroundColor: '#f1f3f5', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap'
                    }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{ 
                                    padding: '8px 30px 8px 10px', 
                                    borderRadius: '5px', border: '1px solid #ccc', width: '250px' 
                                }}
                            />
                            {busqueda && (
                                <button 
                                    onClick={handleLimpiarFiltro}
                                    style={{
                                        position: 'absolute', right: '5px', background: 'none', border: 'none',
                                        color: '#999', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem'
                                    }}
                                    title="Limpiar filtro"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        
                        <Boton onClick={handleBuscar}>🔍</Boton>

                        <div style={{ width: '1px', height: '30px', background: '#ccc', margin: '0 5px' }}></div>

                        <button 
                            onClick={handleInvertirOrden}
                            style={{
                                padding: '8px 15px', background: 'white', border: '1px solid #007bff',
                                color: '#007bff', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            {ordenDescendente ? "📅 Fecha Descendente (↓)" : "📅 Fecha Ascendente (↑)"}
                        </button>
                    </div>
                )}

                {/* --- REJILLA Y MENSAJES DE ESTADO --- */}
                {cargando ? (
                    <p>Cargando elementos...</p>
                ) : elementosOrdenados.length === 0 ? (
                    
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                        
                        {busqueda !== "" ? (
                            // CASO 1: Hay búsqueda, pero no resultados
                            <>
                                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#555' }}>
                                    No se encontraron elementos.
                                </p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Intenta con otra palabra o limpia el filtro.
                                </p>
                            </>
                        ) : (
                            // CASO 2: El usuario no tiene nada (Vista simplificada)
                            <>
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>📂</span>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#555', margin: 0 }}>
                                    Aún no tienes elementos
                                </p>
                                {/* TEXTO Y BOTÓN ELIMINADOS AQUÍ */}
                            </>
                        )}
                    </div>

                ) : (
                    // --- LISTADO DE TARJETAS ---
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {elementosOrdenados.map((item) => (
                            <div key={item._id} style={{ 
                                border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', 
                                background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ width: '100%', height: '180px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    {item.enlaces && item.enlaces.length > 0 ? (
                                        <img src={item.enlaces[0]} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: '#aaa', fontSize: '2rem' }}>📷</span>
                                    )}
                                    <span style={{ 
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: item.booleana ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)', 
                                        color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                                    }}>
                                        {item.booleana ? "ON" : "OFF"}
                                    </span>
                                </div>
                                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{item.nombre}</h3>
                                    <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#777' }}>{new Date(item.fecha).toLocaleString()}</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                        <button onClick={() => handleAbrirEditar(item)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #007bff', background: 'white', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                                        <button onClick={() => handleBorrar(item._id)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dc3545', background: 'white', color: '#dc3545', cursor: 'pointer' }}>🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {mostrarPopup && (
                <CrearElementoPopUp 
                    onClose={() => setMostrarPopup(false)} 
                    onRecargar={() => cargarDatos(busqueda)} 
                    elementoAEditar={elementoAEditar}
                />
            )}
        </div>
    );
};

export default Home;