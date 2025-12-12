import React, { useState, useEffect } from "react";
import "../../estilos/EventoPopUp.css"; 
import Boton from "../Boton";
import Multimedia from "../Multimedia"; 
import Mapa from "../Mapa"; // <--- IMPORTANTE: Importamos el Mapa

import { useAuth } from "../../contextos/AuthContext";
import { crearParcial2, modificarParcial2 } from "../../services/servicesParcial2";
import { Parcial2Crear, Parcial2Actualizar, Parcial2Respuesta } from "../../esquemas/esquemas";

interface Props {
    onClose: () => void;
    onRecargar: () => void;
    elementoAEditar?: Parcial2Respuesta | null;
    readonly?: boolean;
}

export default function CrearElementoPopUp({ onClose, onRecargar, elementoAEditar, readonly = false }: Props) {
    const { user } = useAuth();

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [valoracion, setValoracion] = useState<number>(5);
    const [fotos, setFotos] = useState<string[]>([]);
    
    // Estados de carga
    const [guardando, setGuardando] = useState(false);
    const [subiendoFotos, setSubiendoFotos] = useState(false);

    // Cargar datos al editar/ver
    useEffect(() => {
        if (elementoAEditar) {
            setNombre(elementoAEditar.nombre);
            setDireccion(elementoAEditar.direccion);
            setValoracion(elementoAEditar.valoracion);
            setFotos(elementoAEditar.enlaces || []);
        }
    }, [elementoAEditar]);

    // --- FUNCIÓN DE GEOCODING ---
    const obtenerCoordenadas = async (direccionPostal: string) => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccionPostal)}&format=json&limit=1`;
            const resp = await fetch(url);
            const data = await resp.json();

            if (data && data.length > 0) {
                return {
                    latitud: data[0].lat,
                    longitud: data[0].lon
                };
            }
            return null;
        } catch (error) {
            console.error("Error geocoding:", error);
            return null;
        }
    };

    // --- HELPER: Formatear Fechas (Timestamp a legible) ---
    const formatearFecha = (fechaRaw: string) => {
        if (!fechaRaw) return "Desconocida";
        // Si es un número (timestamp de Firebase), lo convertimos a número
        const esNumero = !isNaN(Number(fechaRaw));
        const fecha = new Date(esNumero ? Number(fechaRaw) : fechaRaw);
        return fecha.toLocaleString(); // Devuelve formato local: "12/12/2025 10:30:00"
    };

    // --- GUARDAR ---
    const handleGuardar = async () => {
        if (!user?.uid) { alert("Error usuario"); return; }
        
        if (!nombre.trim() || !direccion.trim()) { 
            alert("Nombre y dirección son obligatorios"); 
            return; 
        }

        if (valoracion < 0 || valoracion > 5) {
            alert("Reseña no válida. La valoración debe estar entre 0 y 5.");
            return;
        }

        setGuardando(true);

        try {
            let coordsBackend = [];
            if (!readonly) {
                const latLon = await obtenerCoordenadas(direccion);
                if (latLon) {
                    coordsBackend.push(latLon);
                }
            }

            const tokenResult = await user.getIdTokenResult();
            
            const datosBase = {
                nombre: nombre,
                direccion: direccion,
                valoracion: valoracion,
                fecha: new Date().toISOString(),
                coordenadas: coordsBackend,
                enlaces: fotos
            };

            let exito = false;

            if (elementoAEditar) {
                const datosActualizar: Parcial2Actualizar = { ...datosBase };
                exito = await modificarParcial2(elementoAEditar._id, datosActualizar);
            } else {
                const datosCrear: Parcial2Crear = {
                    ...datosBase,
                    usuarioId: user.uid,
                    autor_email: user.email || "anonimo@reviews.com",
                    autor_nombre: user.displayName || "Anónimo",
                    token_id: tokenResult.token,
                    token_emision: String(tokenResult.issuedAtTime), 
                    token_caducidad: String(tokenResult.expirationTime)
                };
                
                const res = await crearParcial2(datosCrear);
                if (res) exito = true;
            }

            if (exito) {
                onRecargar();
                onClose();
            } else {
                alert("Error al guardar.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="evento-popup-overlay" onClick={onClose}>
            <div className="evento-popup-card" onClick={(e) => e.stopPropagation()}>
                
                <div className="evento-popup-header">
                    <h2>{readonly ? "Detalle de Reseña" : (elementoAEditar ? "Editar Reseña" : "Nueva Reseña")}</h2>
                    <button className="evento-popup-close" onClick={onClose}>✕</button>
                </div>

                <div className="evento-popup-scroll">
                    
                    {/* Campos Básicos */}
                    <div className="ev-field">
                        <label>Nombre Establecimiento</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            disabled={readonly} 
                            style={readonly ? {border: 'none', background: 'transparent', padding: 0, fontWeight: 'bold', fontSize: '1.2rem'} : {}}
                        />
                    </div>

                    <div className="ev-field">
                        <label>Dirección Postal</label>
                        <input 
                            type="text" 
                            value={direccion} 
                            onChange={(e) => setDireccion(e.target.value)} 
                            disabled={readonly} 
                        />
                    </div>

                    <div className="ev-field">
                        <label>Valoración (0-5)</label>
                        {readonly ? (
                            <div style={{fontSize: '1.2rem', color: '#ffc107'}}>
                                {"⭐".repeat(valoracion)} <span style={{color: '#666', fontSize:'1rem'}}>({valoracion}/5)</span>
                            </div>
                        ) : (
                            <input 
                                type="number" 
                                min="0" max="5" 
                                value={valoracion} 
                                onChange={(e) => setValoracion(Number(e.target.value))} 
                            />
                        )}
                    </div>

                    {/* --- MAPA (Visible en modo lectura si hay coordenadas) --- */}
                    {readonly && elementoAEditar?.coordenadas && elementoAEditar.coordenadas.length > 0 && (
                        <div className="ev-field">
                            <label>Ubicación:</label>
                            <div className="ev-map-wrapper">
                                <Mapa 
                                    savedCoordinates={elementoAEditar.coordenadas} 
                                    editable={false} 
                                />
                            </div>
                        </div>
                    )}

                    {/* --- IMÁGENES --- */}
                    <div className="ev-field">
                        {/* En modo lectura solo se muestra si hay fotos. En edición siempre. */}
                        {(!readonly || fotos.length > 0) && (
                            <>
                                <label>Imágenes:</label>
                                <Multimedia 
                                    urls={fotos} 
                                    onChange={setFotos} 
                                    editable={!readonly}
                                    onUploadStatusChange={setSubiendoFotos}
                                    allowMultiple={true}
                                />
                            </>
                        )}
                    </div>

                    {/* --- INFORMACIÓN DE AUDITORÍA (TOKEN) --- */}
                    {readonly && elementoAEditar && (
                        <div style={{background: '#f1f3f5', padding: '15px', borderRadius: '8px', marginTop: '20px', border: '1px solid #dee2e6'}}>
                            <h4 style={{marginTop:0, marginBottom:'15px', color: '#495057', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                                🔐 Datos de Seguridad y Autoría
                            </h4>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem'}}>
                                <div>
                                    <strong>👤 Autor:</strong> <br/> {elementoAEditar.autor_nombre}
                                </div>
                                <div>
                                    <strong>📧 Email:</strong> <br/> {elementoAEditar.autor_email}
                                </div>
                                <div>
                                    <strong>📅 Emisión Token:</strong> <br/> {formatearFecha(elementoAEditar.token_emision)}
                                </div>
                                <div>
                                    <strong>⏳ Caducidad Token:</strong> <br/> {formatearFecha(elementoAEditar.token_caducidad)}
                                </div>
                            </div>

                            <div style={{marginTop:'15px'}}>
                                <label style={{fontSize:'0.8rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Token OAuth (Hash):</label>
                                <textarea 
                                    readOnly 
                                    style={{
                                        width:'100%', fontSize:'0.75rem', height:'50px', 
                                        resize:'none', fontFamily: 'monospace', 
                                        backgroundColor: '#e9ecef', border: '1px solid #ced4da', borderRadius: '4px', padding: '5px'
                                    }} 
                                    value={elementoAEditar.token_id} 
                                />
                            </div>
                        </div>
                    )}

                </div>

                <div className="evento-popup-actions">
                    <Boton tipo="mini-rojo" onClick={onClose}>{readonly ? "Cerrar" : "Cancelar"}</Boton>
                    
                    {!readonly && (
                        <Boton onClick={handleGuardar} disabled={guardando || subiendoFotos}>
                            {subiendoFotos 
                                ? "Subiendo fotos..." 
                                : (guardando ? "Guardando..." : (elementoAEditar ? "Guardar" : "Crear Reseña"))}
                        </Boton>
                    )}
                </div>

            </div>
        </div>
    );
}