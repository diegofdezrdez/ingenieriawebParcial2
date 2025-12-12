import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contextos/AuthContext';
import ControlAcceso from '../componentes/ControlAcceso';
import Boton from "../componentes/Boton";
import CrearElementoPopUp from '../componentes/PopUp/CrearElementoPopUp';
import Mapa from "../componentes/Mapa";
import { listarParcial2, eliminarParcial2 } from "../services/servicesParcial2"; 
import { Parcial2Respuesta } from "../esquemas/esquemas";
import '../estilos/Home.css';

const Home = () => {
    const { user } = useAuth();
    
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [elementoAEditar, setElementoAEditar] = useState<Parcial2Respuesta | null>(null);
    const [elementos, setElementos] = useState<Parcial2Respuesta[]>([]);
    const [cargando, setCargando] = useState(false);
    const [modoLectura, setModoLectura] = useState(false);

    // Filtros de listado
    const [busqueda, setBusqueda] = useState(""); 
    const [ordenDescendente, setOrdenDescendente] = useState(true);
    const [modoVista, setModoVista] = useState<'mis' | 'todos'>('mis');

    // Filtros de Mapa
    const [busquedaMapa, setBusquedaMapa] = useState("");
    const [centroMapa, setCentroMapa] = useState<{lat: number, lon: number} | null>(null);

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

    const coordenadasTotales = useMemo(() => {
        const coords: {latitud: string, longitud: string}[] = [];
        elementos.forEach(el => {
            if (el.coordenadas && el.coordenadas.length > 0) {
                el.coordenadas.forEach(c => coords.push(c));
            }
        });
        return coords;
    }, [elementos]);

    // --- ACCIONES LISTADO ---
    const handleBuscar = () => cargarDatos(busqueda);
    const handleLimpiarFiltro = () => setBusqueda(""); 
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleBuscar(); };
    const handleInvertirOrden = () => setOrdenDescendente(!ordenDescendente);

    // --- ACCIONES MAPA (Buscador y Reset) ---
    const handleBuscarEnMapa = async () => {
        if (!busquedaMapa.trim()) return;
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(busquedaMapa)}&format=json&limit=1`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (data && data.length > 0) {
                setCentroMapa({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
            } else {
                alert("Dirección no encontrada");
            }
        } catch (e) {
            console.error(e);
            alert("Error al buscar dirección");
        }
    };

    const handleLimpiarMapa = () => {
        setBusquedaMapa("");
        setCentroMapa(null); // Esto reseteará el mapa en Mapa.tsx
    };

    const handleInputMapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusquedaMapa(e.target.value);
        if (e.target.value === "") {
            setCentroMapa(null); // Si borra todo a mano, también reseteamos
        }
    };
    
    // --- ACCIONES POPUPS ---
    const handleAbrirCrear = () => {
        setElementoAEditar(null);
        setModoLectura(false);
        setMostrarPopup(true);
    };

    const handleAbrirEditar = (item: Parcial2Respuesta, e: React.MouseEvent) => {
        e.stopPropagation();
        setElementoAEditar(item);
        setModoLectura(false);
        setMostrarPopup(true);
    };

    const handleVerDetalles = (item: Parcial2Respuesta) => {
        setElementoAEditar(item);
        setModoLectura(true);
        setMostrarPopup(true);
    };

    const handleBorrar = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro que quieres borrar esta reseña?")) return;
        const exito = await eliminarParcial2(id);
        if (exito) cargarDatos(busqueda); 
    };

    return (
        <div className="home-layout">
            <div className="home-topbar">
                <div className="topbar-logo">ReViews</div>
                <div className="topbar-perfil"><ControlAcceso /></div>
            </div>

            <div className="home-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 style={{margin: 0}}>{modoVista === 'mis' ? "Mis Reseñas" : "Todas las Reseñas"}</h1>
                        <div style={{ background: '#e9ecef', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                            <button onClick={() => setModoVista('mis')} style={{ border: 'none', padding: '6px 15px', borderRadius: '6px', background: modoVista === 'mis' ? 'white' : 'transparent', color: modoVista === 'mis' ? '#007bff' : '#666', fontWeight: 'bold', boxShadow: modoVista === 'mis' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Mías</button>
                            <button onClick={() => setModoVista('todos')} style={{ border: 'none', padding: '6px 15px', borderRadius: '6px', background: modoVista === 'todos' ? 'white' : 'transparent', color: modoVista === 'todos' ? '#007bff' : '#666', fontWeight: 'bold', boxShadow: modoVista === 'todos' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Todas</button>
                        </div>
                    </div>
                    <Boton onClick={handleAbrirCrear}>+ Nueva Reseña</Boton>
                </div>

                {/* --- SECCIÓN MAPA GENERAL --- */}
                <div style={{ marginBottom: '30px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>🌍 Mapa de Reseñas</h3>
                        
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {/* Buscador Mapa idéntico al de abajo */}
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="text" 
                                    placeholder="Centrar mapa en..." 
                                    value={busquedaMapa}
                                    onChange={handleInputMapaChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarEnMapa()}
                                    style={{ padding: '8px 30px 8px 10px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }}
                                />
                                {busquedaMapa && (
                                    <button 
                                        onClick={handleLimpiarMapa} 
                                        style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', color: '#999', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <button onClick={handleBuscarEnMapa} style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Ir</button>
                        </div>
                    </div>
                    
                    <Mapa 
                        savedCoordinates={coordenadasTotales} 
                        editable={false} 
                        centroExterno={centroMapa} 
                    />
                </div>

                {/* --- LISTADO Y FILTROS --- */}
                {(elementos.length > 0 || busqueda !== "" || modoVista === 'todos') && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f1f3f5', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Filtrar listado..." 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                                onKeyDown={handleKeyDown} 
                                style={{ padding: '8px 30px 8px 10px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }} 
                            />
                            {busqueda && (
                                <button onClick={handleLimpiarFiltro} style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', color: '#999', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                            )}
                        </div>
                        <Boton onClick={handleBuscar}>🔍</Boton>
                        <div style={{ width: '1px', height: '30px', background: '#ccc', margin: '0 5px' }}></div>
                        <button onClick={handleInvertirOrden} style={{ padding: '8px 15px', background: 'white', border: '1px solid #007bff', color: '#007bff', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{ordenDescendente ? "📅 Fecha ↓" : "📅 Fecha ↑"}</button>
                    </div>
                )}

                {cargando ? <p>Cargando reseñas...</p> : elementosOrdenados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                         <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#555' }}>No hay reseñas visibles</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {elementosOrdenados.map((item) => {
                            const esMio = item.usuarioId === user?.uid;
                            return (
                                <div 
                                    key={item._id} 
                                    onClick={() => handleVerDetalles(item)}
                                    style={{ 
                                        border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', 
                                        background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
                                        cursor: 'pointer', transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ width: '100%', height: '160px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        {item.enlaces && item.enlaces.length > 0 ? (
                                            <img src={item.enlaces[0]} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: '#ccc', fontSize: '3rem' }}>🏢</span>
                                        )}
                                        <span style={{ 
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: '#ffc107', color: '#333', padding: '4px 8px', 
                                            borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            ⭐ {item.valoracion}
                                        </span>
                                    </div>

                                    <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{item.nombre}</h3>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>📍 {item.direccion}</p>
                                        
                                        {item.coordenadas && item.coordenadas.length > 0 && (
                                            <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 10px 0' }}>
                                                GPS: {parseFloat(item.coordenadas[0].latitud).toFixed(4)}, {parseFloat(item.coordenadas[0].longitud).toFixed(4)}
                                            </p>
                                        )}

                                        {esMio && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
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
                    readonly={modoLectura}
                />
            )}
        </div>
    );
};

export default Home;