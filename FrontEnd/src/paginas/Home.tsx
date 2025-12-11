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

    // --- NUEVO: Estado para saber si abrimos en modo lectura ---
    const [modoLectura, setModoLectura] = useState(false);

    // Filtros y Vista
    const [busqueda, setBusqueda] = useState(""); 
    const [ordenDescendente, setOrdenDescendente] = useState(true);
    const [modoVista, setModoVista] = useState<'mis' | 'todos'>('mis');

    // ... (cargarDatos, useEffects y useMemo SE MANTIENEN IGUAL) ...
    // --- COPIA PEGA TUS FUNCIONES DE CARGA Y ORDENAMIENTO AQUÍ ---
    const cargarDatos = async (filtroTexto: string = busqueda) => {
        if (!user?.uid) return;
        setCargando(true);
        const usuarioIdParaBackend = modoVista === 'mis' ? user.uid : undefined;
        const nombreParaBackend = (!filtroTexto || filtroTexto.trim() === "") ? undefined : filtroTexto;
        try {
            const datos = await listarParcial2({ usuarioId: usuarioIdParaBackend, nombre: nombreParaBackend });
            if (datos) setElementos(datos);
            else setElementos([]);
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    useEffect(() => { cargarDatos(); }, [user, modoVista]);
    useEffect(() => { if (busqueda === "") cargarDatos(); }, [busqueda]);

    const elementosOrdenados = useMemo(() => {
        if (!elementos) return [];
        return [...elementos].sort((a, b) => {
            const fechaA = new Date(a.fecha).getTime();
            const fechaB = new Date(b.fecha).getTime();
            return ordenDescendente ? fechaB - fechaA : fechaA - fechaB;
        });
    }, [elementos, ordenDescendente]);

    // --- MANEJADORES ---
    
    const handleBuscar = () => cargarDatos(busqueda);
    const handleLimpiarFiltro = () => setBusqueda(""); 
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleBuscar(); };
    const handleInvertirOrden = () => setOrdenDescendente(!ordenDescendente);

    // Abrir CREAR (reseteamos modo lectura)
    const handleAbrirCrear = () => {
        setElementoAEditar(null);
        setModoLectura(false); // <--- Importante
        setMostrarPopup(true);
    };

    // Abrir EDITAR (reseteamos modo lectura)
    const handleAbrirEditar = (item: Parcial2Respuesta, e: React.MouseEvent) => {
        e.stopPropagation(); // <--- EVITA QUE SE ABRA EL DETALLE AL CLICKAR
        setElementoAEditar(item);
        setModoLectura(false); // <--- Importante
        setMostrarPopup(true);
    };

    // Abrir DETALLES (activamos modo lectura)
    const handleVerDetalles = (item: Parcial2Respuesta) => {
        setElementoAEditar(item);
        setModoLectura(true); // <--- ACTIVAMOS LECTURA
        setMostrarPopup(true);
    };

    const handleBorrar = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // <--- EVITA QUE SE ABRA EL DETALLE
        if (!window.confirm("¿Seguro que quieres borrar este elemento?")) return;
        const exito = await eliminarParcial2(id);
        if (exito) cargarDatos(busqueda); 
    };

    return (
        <div className="home-layout">
            <div className="home-topbar">
                <div className="topbar-logo">Kalendas</div>
                <div className="topbar-perfil"><ControlAcceso /></div>
            </div>

            <div className="home-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 style={{margin: 0}}>{modoVista === 'mis' ? "Mis Elementos" : "Comunidad"}</h1>
                        <div style={{ background: '#e9ecef', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                            <button onClick={() => setModoVista('mis')} style={{ border: 'none', padding: '6px 15px', borderRadius: '6px', background: modoVista === 'mis' ? 'white' : 'transparent', color: modoVista === 'mis' ? '#007bff' : '#666', fontWeight: 'bold', boxShadow: modoVista === 'mis' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Míos</button>
                            <button onClick={() => setModoVista('todos')} style={{ border: 'none', padding: '6px 15px', borderRadius: '6px', background: modoVista === 'todos' ? 'white' : 'transparent', color: modoVista === 'todos' ? '#007bff' : '#666', fontWeight: 'bold', boxShadow: modoVista === 'todos' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Todos</button>
                        </div>
                    </div>
                    <Boton onClick={handleAbrirCrear}>+ Añadir Elemento</Boton>
                </div>

                {/* BARRA DE FILTRADO (Igual que antes) */}
                {(elementos.length > 0 || busqueda !== "" || modoVista === 'todos') && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f1f3f5', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={handleKeyDown} style={{ padding: '8px 30px 8px 10px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }} />
                            {busqueda && <button onClick={handleLimpiarFiltro} style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', color: '#999', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>}
                        </div>
                        <Boton onClick={handleBuscar}>🔍</Boton>
                        <div style={{ width: '1px', height: '30px', background: '#ccc', margin: '0 5px' }}></div>
                        <button onClick={handleInvertirOrden} style={{ padding: '8px 15px', background: 'white', border: '1px solid #007bff', color: '#007bff', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{ordenDescendente ? "📅 Fecha Descendente (↓)" : "📅 Fecha Ascendente (↑)"}</button>
                    </div>
                )}

                {/* LISTADO */}
                {cargando ? <p>Cargando elementos...</p> : elementosOrdenados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                        {busqueda !== "" ? (
                            <>
                                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#555' }}>No se encontraron elementos.</p>
                                <p style={{ fontSize: '0.9rem' }}>Intenta con otra palabra o limpia el filtro.</p>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>{modoVista === 'mis' ? '📂' : '🌍'}</span>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#555', margin: 0 }}>{modoVista === 'mis' ? "Aún no tienes elementos" : "No hay elementos en la comunidad"}</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {elementosOrdenados.map((item) => {
                            const esMio = item.usuarioId === user?.uid;
                            return (
                                <div 
                                    key={item._id} 
                                    // --- CAMBIO: onClick en la tarjeta para ver detalles ---
                                    onClick={() => handleVerDetalles(item)}
                                    style={{ 
                                        border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', 
                                        background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
                                        cursor: 'pointer', transition: 'transform 0.2s' // Cursor mano para indicar clic
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ width: '100%', height: '180px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        {item.enlaces && item.enlaces.length > 0 ? (
                                            <img src={item.enlaces[0]} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: '#aaa', fontSize: '2rem' }}>📷</span>
                                        )}
                                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: item.booleana ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>{item.booleana ? "ON" : "OFF"}</span>
                                        {esMio && modoVista === 'todos' && <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0, 123, 255, 0.9)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Mío</span>}
                                    </div>

                                    <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{item.nombre}</h3>
                                        <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#777' }}>{new Date(item.fecha).toLocaleString()}</p>
                                        
                                        {esMio && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                                {/* --- CAMBIO: Pasamos el evento 'e' para hacer stopPropagation --- */}
                                                <button onClick={(e) => handleAbrirEditar(item, e)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #007bff', background: 'white', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                                                <button onClick={(e) => handleBorrar(item._id, e)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dc3545', background: 'white', color: '#dc3545', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {mostrarPopup && (
                <CrearElementoPopUp 
                    onClose={() => setMostrarPopup(false)} 
                    onRecargar={() => cargarDatos(busqueda)} 
                    elementoAEditar={elementoAEditar}
                    readonly={modoLectura} // --- CAMBIO: Pasamos el modo lectura ---
                />
            )}
        </div>
    );
};

export default Home;