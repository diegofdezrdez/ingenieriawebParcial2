import React, { useState, useEffect } from "react";
import "../../estilos/EventoPopUp.css"; 
import Boton from "../Boton";

import Mapa from "../Mapa";
import Multimedia from "../Multimedia";

import { useAuth } from "../../contextos/AuthContext";
import { crearParcial2, modificarParcial2 } from "../../services/servicesParcial2";
import { Parcial2Crear, Parcial2Actualizar, Coordenada, Parcial2Respuesta } from "../../esquemas/esquemas";

interface Props {
    onClose: () => void;
    onRecargar: () => void;
    elementoAEditar?: Parcial2Respuesta | null;
    readonly?: boolean; // --- CAMBIO: Nueva prop opcional ---
}

export default function CrearElementoPopUp({ onClose, onRecargar, elementoAEditar, readonly = false }: Props) {
    const { user } = useAuth();

    // Estados
    const [nombre, setNombre] = useState("");
    const [numeroStr, setNumeroStr] = useState<string>(""); 
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
    const [booleana, setBooleana] = useState(false);
    
    // Estados complejos
    const [fotos, setFotos] = useState<string[]>([]);
    const [subiendo, setSubiendo] = useState(false);
    const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]); 
    const [coordTemp, setCoordTemp] = useState<Coordenada | null>(null); 

    useEffect(() => {
        if (elementoAEditar) {
            setNombre(elementoAEditar.nombre);
            setNumeroStr(elementoAEditar.numero.toString());
            try {
                const fechaDate = new Date(elementoAEditar.fecha);
                if (!isNaN(fechaDate.getTime())) {
                    setFecha(fechaDate.toISOString().slice(0, 16));
                }
            } catch (e) {
                console.warn("Error fecha", e);
            }
            setBooleana(elementoAEditar.booleana);
            if (elementoAEditar.enlaces) setFotos(elementoAEditar.enlaces);
            if (elementoAEditar.coordenadas) setCoordenadas(elementoAEditar.coordenadas);
        }
    }, [elementoAEditar]);

    const handleMapClick = (lat: number, lon: number) => {
        // --- CAMBIO: Si es readonly, no hacemos nada al hacer clic en el mapa ---
        if (readonly) return;
        setCoordTemp({ latitud: lat.toString(), longitud: lon.toString() });
    };

    const handleAgregarUbicacion = (e: React.MouseEvent) => {
        e.preventDefault();
        if (coordTemp) {
            setCoordenadas([...coordenadas, coordTemp]);
            setCoordTemp(null); 
        }
    };

    const handleEliminarUbicacion = (index: number) => {
        // --- CAMBIO: Si es readonly, no dejamos borrar ---
        if (readonly) return;
        const nuevas = [...coordenadas];
        nuevas.splice(index, 1);
        setCoordenadas(nuevas);
    };

    const handleGuardar = async () => {
        // ... (Lógica de guardar se mantiene igual, pero el botón estará oculto si es readonly)
        if (!user?.uid) { alert("Error usuario"); return; }
        if (!nombre.trim()) { alert("Nombre obligatorio"); return; }

        const numeroFinal = numeroStr === "" ? 0 : parseInt(numeroStr);
        const datosBase = {
            nombre: nombre,
            numero: numeroFinal,
            fecha: new Date(fecha).toISOString(),
            booleana: booleana,
            coordenadas: coordenadas.length > 0 ? coordenadas : null,
            enlaces: fotos.length > 0 ? fotos : null 
        };

        try {
            let exito = false;
            if (elementoAEditar) {
                const datosActualizar: Parcial2Actualizar = { ...datosBase, usuarioId: elementoAEditar.usuarioId };
                exito = await modificarParcial2(elementoAEditar._id, datosActualizar);
            } else {
                const datosCrear: Parcial2Crear = { ...datosBase, usuarioId: user.uid };
                const res = await crearParcial2(datosCrear);
                if (res) exito = true;
            }

            if (exito) {
                onRecargar();
                onClose();
            } else {
                alert("Error servidor");
            }
        } catch (error) {
            console.error(error);
            alert("Error conexión");
        }
    };

    return (
        <div className="evento-popup-overlay" onClick={onClose}>
            <div className="evento-popup-card" onClick={(e) => e.stopPropagation()}>
                
                <div className="evento-popup-header">
                    {/* --- CAMBIO: Título dinámico --- */}
                    <h2>{readonly ? "Detalles" : (elementoAEditar ? "Editar" : "Nuevo")}</h2>
                    <button className="evento-popup-close" onClick={onClose}>✕</button>
                </div>

                <div className="evento-popup-scroll">
                    
                    <div className="ev-field">
                        <label>Nombre</label>
                        {/* --- CAMBIO: Propiedad disabled --- */}
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={readonly} />
                    </div>

                    <div className="ev-two-col">
                        <div className="ev-field">
                            <label>Número</label>
                            <input type="number" value={numeroStr} onChange={(e) => setNumeroStr(e.target.value)} disabled={readonly} />
                        </div>
                        <div className="ev-field">
                            <label>Fecha</label>
                            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={readonly} />
                        </div>
                    </div>

                    <div className="ev-field">
                        <label>Estado</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" checked={booleana} onChange={(e) => setBooleana(e.target.checked)} disabled={readonly} style={{ width: '20px', height: '20px' }} />
                            <span>{booleana ? "Activado" : "Desactivado"}</span>
                        </div>
                    </div>

                    <div className="ev-field">
                        <label>Ubicación(es)</label>
                        <div className="ev-map-wrapper">
                            {/* --- CAMBIO: editable depende de readonly --- */}
                            <Mapa editable={!readonly} savedCoordinates={coordenadas} onMapClick={handleMapClick} />
                        </div>
                        
                        {/* Ocultamos controles de mapa si es readonly */}
                        {!readonly && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Boton onClick={handleAgregarUbicacion} disabled={!coordTemp} className={!coordTemp ? 'boton-disabled' : ''}>
                                    Guardar Ubicación Seleccionada
                                </Boton>
                            </div>
                        )}

                        {coordenadas.length > 0 && (
                            <ul style={{ background: '#f9f9f9', padding: '10px 20px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                {coordenadas.map((c, i) => (
                                    <li key={i} style={{marginBottom: '5px', display: 'flex', justifyContent: 'space-between'}}>
                                        <span>Lat: {parseFloat(c.latitud).toFixed(4)}, Lon: {parseFloat(c.longitud).toFixed(4)}</span>
                                        {/* Solo mostramos la X si NO es readonly */}
                                        {!readonly && <span onClick={() => handleEliminarUbicacion(i)} style={{color:'red', cursor:'pointer', fontWeight:'bold'}}>×</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="ev-field">
                        {/* --- CAMBIO: editable false si es readonly --- */}
                        <Multimedia urls={fotos} editable={!readonly} allowMultiple={true} onChange={setFotos} onUploadStatusChange={setSubiendo} />
                    </div>

                </div>

                <div className="evento-popup-actions">
                    <Boton tipo="mini-rojo" onClick={onClose}>
                        {readonly ? "Cerrar" : "Cancelar"}
                    </Boton>
                    {/* --- CAMBIO: Ocultamos botón de guardar si es readonly --- */}
                    {!readonly && (
                        <Boton onClick={handleGuardar} disabled={subiendo}>
                            {subiendo ? "Subiendo..." : (elementoAEditar ? "Guardar Cambios" : "Crear")}
                        </Boton>
                    )}
                </div>

            </div>
        </div>
    );
}