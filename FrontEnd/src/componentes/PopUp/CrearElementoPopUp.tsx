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
}

export default function CrearElementoPopUp({ onClose, onRecargar, elementoAEditar }: Props) {
    const { user } = useAuth();

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    
    // CAMBIO 1: Inicializamos como string vacío para que no salga el "0" al principio
    const [numeroStr, setNumeroStr] = useState<string>(""); 

    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
    const [booleana, setBooleana] = useState(false);
    
    // Estados complejos
    const [fotos, setFotos] = useState<string[]>([]);
    const [subiendo, setSubiendo] = useState(false);

    // Mapa
    const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]); 
    const [coordTemp, setCoordTemp] = useState<Coordenada | null>(null); 

    // --- EFECTO PARA CARGAR DATOS SI ESTAMOS EDITANDO ---
    useEffect(() => {
        if (elementoAEditar) {
            setNombre(elementoAEditar.nombre);
            // Si hay dato, lo convertimos a string. Si es 0, se ve "0", pero al editar es normal.
            setNumeroStr(elementoAEditar.numero.toString());
            
            // Ajuste fecha para input datetime-local
            // Intenta manejar fechas que vengan completas o cortas
            try {
                const fechaDate = new Date(elementoAEditar.fecha);
                if (!isNaN(fechaDate.getTime())) {
                     // Slice para quitar segundos y zona horaria (formato requerido por input type="datetime-local")
                    setFecha(fechaDate.toISOString().slice(0, 16));
                }
            } catch (e) {
                console.warn("Error parseando fecha al editar", e);
            }

            setBooleana(elementoAEditar.booleana);
            
            if (elementoAEditar.enlaces) setFotos(elementoAEditar.enlaces);
            if (elementoAEditar.coordenadas) setCoordenadas(elementoAEditar.coordenadas);
        }
    }, [elementoAEditar]);


    // Manejadores Mapa
    const handleMapClick = (lat: number, lon: number) => {
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
        const nuevas = [...coordenadas];
        nuevas.splice(index, 1);
        setCoordenadas(nuevas);
    };

    // ... resto del código anterior ...

    // GUARDAR (CREAR O EDITAR)
    const handleGuardar = async () => {
        if (!user?.uid) {
            alert("Error: Usuario no identificado.");
            return;
        }
        if (!nombre.trim()) {
            alert("El nombre es obligatorio.");
            return;
        }

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
                // --- MODO EDICIÓN ---
                const datosActualizar: Parcial2Actualizar = {
                    ...datosBase,
                    usuarioId: elementoAEditar.usuarioId
                };
                exito = await modificarParcial2(elementoAEditar._id, datosActualizar);
            } else {
                // --- MODO CREACIÓN ---
                const datosCrear: Parcial2Crear = {
                    ...datosBase,
                    usuarioId: user.uid
                };
                const resultado = await crearParcial2(datosCrear);
                if (resultado) exito = true;
            }

            if (exito) {
                // --- CAMBIO: QUITAMOS EL ALERT DE ÉXITO ---
                // alert(elementoAEditar ? "¡Actualizado con éxito!" : "¡Creado con éxito!"); 
                
                onRecargar(); // Recargamos la lista de fondo
                onClose();    // Cerramos la ventana directamente
            } else {
                alert("Error al guardar en el servidor.");
            }
        } catch (error) {
            console.error("Error capturado en frontend:", error);
            alert("Error de conexión.");
        }
    };

    return (
        <div className="evento-popup-overlay" onClick={onClose}>
            <div className="evento-popup-card" onClick={(e) => e.stopPropagation()}>
                
                <div className="evento-popup-header">
                    <h2>{elementoAEditar ? "Editar Elemento" : "Nuevo Elemento"}</h2>
                    <button className="evento-popup-close" onClick={onClose}>✕</button>
                </div>

                <div className="evento-popup-scroll">
                    
                    {/* Nombre */}
                    <div className="ev-field">
                        <label>Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>

                    {/* Número y Fecha */}
                    <div className="ev-two-col">
                        <div className="ev-field">
                            <label>Número</label>
                            {/* CAMBIO 2: Input controlado por string para evitar el 0 inicial */}
                            <input 
                                type="number" 
                                value={numeroStr} 
                                onChange={(e) => setNumeroStr(e.target.value)} 
                                placeholder="0"
                            />
                        </div>
                        <div className="ev-field">
                            <label>Fecha</label>
                            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                        </div>
                    </div>

                    {/* Booleana */}
                    <div className="ev-field">
                        <label>Estado</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" checked={booleana} onChange={(e) => setBooleana(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                            <span>{booleana ? "Activado" : "Desactivado"}</span>
                        </div>
                    </div>

                    {/* Mapa */}
                    <div className="ev-field">
                        <label>Ubicación(es)</label>
                        <div className="ev-map-wrapper">
                            <Mapa editable={true} savedCoordinates={coordenadas} onMapClick={handleMapClick} />
                        </div>
                        
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Boton onClick={handleAgregarUbicacion} disabled={!coordTemp} className={!coordTemp ? 'boton-disabled' : ''}>
                                Guardar Ubicación Seleccionada
                            </Boton>

                            {coordenadas.length > 0 && (
                                <ul style={{ background: '#f9f9f9', padding: '10px 20px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    {coordenadas.map((c, i) => (
                                        <li key={i} style={{marginBottom: '5px', display: 'flex', justifyContent: 'space-between'}}>
                                            <span>Lat: {parseFloat(c.latitud).toFixed(4)}, Lon: {parseFloat(c.longitud).toFixed(4)}</span>
                                            <span onClick={() => handleEliminarUbicacion(i)} style={{color:'red', cursor:'pointer', fontWeight:'bold'}}>×</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Multimedia */}
                    <div className="ev-field">
                        <Multimedia urls={fotos} editable={true} allowMultiple={true} onChange={setFotos} onUploadStatusChange={setSubiendo} />
                    </div>

                </div>

                <div className="evento-popup-actions">
                    <Boton tipo="mini-rojo" onClick={onClose}>Cancelar</Boton>
                    <Boton onClick={handleGuardar} disabled={subiendo}>
                        {subiendo ? "Subiendo..." : (elementoAEditar ? "Guardar Cambios" : "Crear")}
                    </Boton>
                </div>

            </div>
        </div>
    );
}