// ======================================================================
// ========================= IMPORTS ====================================
// ======================================================================
import React, { useState, ChangeEvent } from "react";

// Asegúrate de que la ruta al servicio es correcta en tu proyecto
import { subirMultiplesImagenes } from "../services/MultimediaService";

// ======================================================================
// ========================= INTERFACES =================================
// ======================================================================
interface MultimediaProps {
  /** Lista de URLs de los archivos a mostrar */
  urls: string[];
  
  /** Callback cuando cambia la lista (subida o borrado) */
  onChange?: (newUrls: string[]) => void;
  
  /** Si es true, muestra el input para subir y botones de borrar */
  editable?: boolean;
  
  /** Notifica al padre si está subiendo (para bloquear botones) */
  onUploadStatusChange?: (isUploading: boolean) => void;
  
  /** Tipos MIME permitidos (ej: "image/*,video/*") */
  acceptedFileTypes?: string;
  
  /** * true: Permite subir varias fotos (se añaden a la lista).
   * false: Solo una foto (la nueva reemplaza a la anterior).
   * @default true
   */
  allowMultiple?: boolean;

  /**
   * true: Muestra la imagen/carrusel de lo que se ha subido.
   * false: Oculta la visualización (solo muestra el input de subir).
   * @default true
   */
  showPreview?: boolean; // <--- NUEVA PROP
}

// ======================================================================
// ========================= COMPONENTE =================================
// ======================================================================
const Multimedia: React.FC<MultimediaProps> = ({ 
    urls = [], 
    onChange, 
    editable = false, 
    onUploadStatusChange,
    acceptedFileTypes = "image/*,video/*,audio/*",
    allowMultiple = true,
    showPreview = true // <--- POR DEFECTO TRUE
}) => {
    
    // Estado para controlar qué archivo se muestra en el carrusel
    const [currentIndex, setCurrentIndex] = useState(0);

    // Estado interno para la subida
    const [subiendo, setSubiendo] = useState(false);
    
    // Estado para el visor de pantalla completa (Lightbox)
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<string | null>(null);

    // --- HELPERS: Detectar tipo de archivo ---
    const esVideo = (url: string) => /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
    const esAudio = (url: string) => /\.(mp3|wav|oga|aac|m4a)$/i.test(url);

    // --- MANEJADOR DE SUBIDA ---
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setSubiendo(true);
        if (onUploadStatusChange) onUploadStatusChange(true);

        try {
            // Llamada al servicio real
            const uploadedUrls = await subirMultiplesImagenes(files);
            
            let updatedUrls: string[];

            if (allowMultiple) {
                // Modo Galería: Añadimos las nuevas a las existentes
                updatedUrls = [...urls, ...uploadedUrls];
                // Vamos a la primera de las nuevas
                setCurrentIndex(updatedUrls.length - uploadedUrls.length);
            } else {
                // Modo Único: Reemplazamos todo por la última subida
                updatedUrls = [uploadedUrls[uploadedUrls.length - 1]];
                setCurrentIndex(0);
            }
            
            if (onChange) onChange(updatedUrls);
            
            // Limpiar input
            e.target.value = ""; 

        } catch (error) {
            console.error("Error subiendo archivos", error);
            alert("Error al subir los archivos. Inténtalo de nuevo.");
        } finally {
            setSubiendo(false);
            if (onUploadStatusChange) onUploadStatusChange(false);
        }
    };

    // --- MANEJADOR DE BORRADO ---
    const handleEliminar = async () => {
        const urlToDelete = urls[currentIndex];
        // 1. Llamamos al servicio (opcionalmente activamos un estado de 'cargando' si quieres)
        try {
            // Si el servicio no dio error, actualizamos la lista visual
            const updatedUrls = urls.filter(u => u !== urlToDelete);
            
            if (onChange) onChange(updatedUrls);

            // Ajustamos el índice para que no quede fuera de rango
            if (currentIndex >= updatedUrls.length) {
                setCurrentIndex(Math.max(0, updatedUrls.length - 1));
            }
        } catch (error) {
            alert("Hubo un error al intentar eliminar la imagen del servidor.");
        }
    };

    // --- NAVEGACIÓN ---
    const nextItem = () => setCurrentIndex((prev) => (prev + 1) % urls.length);
    const prevItem = () => setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);

    // --- RENDERIZADO DE CONTENIDO (Imagen, Video o Audio) ---
    const renderContenido = (url: string, esPreview: boolean = false) => {
        if (esVideo(url)) {
            return (
                <video 
                    src={url}
                    controls={!esPreview}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", backgroundColor: "black" }}
                />
            );
        }
        if (esAudio(url)) {
            return (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f3f4", color: "#555" }}>
                    <span style={{ fontSize: "40px", marginBottom: "10px" }}>🎵</span>
                    <audio controls src={url} style={{ width: "90%", maxWidth: "300px" }} />
                </div>
            );
        }
        // Por defecto: Imagen
        return (
            <img 
                src={url} 
                alt="Contenido multimedia" 
                style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer", display: "block" }}
                onClick={() => setArchivoSeleccionado(url)}
            />
        );
    };

    return (
        <div className="multimedia-container" style={{ width: "100%", marginBottom: "15px" }}>
            
            {/* 1. SECCIÓN DE SUBIDA (Visible si es editable) */}
            {editable && (
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                        {allowMultiple ? "Galería Multimedia:" : "Subir archivo:"}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input 
                            type="file" 
                            multiple={allowMultiple}
                            accept={acceptedFileTypes}
                            onChange={handleFileChange}
                            disabled={subiendo}
                        />
                        {subiendo && (
                            <span style={{ color: "#007bff", fontSize: "0.9em", fontWeight: "bold" }}>⏳ Subiendo...</span>
                        )}
                    </div>
                </div>
            )}

            {/* 2. VISUALIZADOR (SOLO SI showPreview ES TRUE) */}
            {showPreview && (
                <>
                    {urls.length > 0 ? (
                        <div style={{ position: "relative", width: "100%", height: "250px", backgroundColor: "#f0f0f0", borderRadius: "8px", overflow: "hidden" }}>
                                
                                {/* Etiqueta Galería solo si hay varias fotos */}
                                {!editable && urls.length > 1 && <p style={{ position: "absolute", top: "5px", left: "10px", zIndex: 10, fontWeight: "bold", color: "white", textShadow: "0 1px 2px black" }}>Galería:</p>}

                                {renderContenido(urls[currentIndex])}

                                {/* Botón expandir (para videos/audio que no tienen click nativo de imagen) */}
                                {!esVideo(urls[currentIndex]) || (
                                    <button type="button" onClick={() => setArchivoSeleccionado(urls[currentIndex])} style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "4px", padding: "5px 10px", cursor: "pointer", fontSize: "12px", zIndex: 15 }}>
                                        ⤢ Pantalla completa
                                    </button>
                                )}

                                {/* Controles de Navegación (Solo si hay más de 1) */}
                                {urls.length > 1 && (
                                    <>
                                        <button type="button" onClick={prevItem} style={{ position: "absolute", top: "50%", left: "10px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", zIndex: 20 }}>&#10094;</button>
                                        <button type="button" onClick={nextItem} style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", zIndex: 20 }}>&#10095;</button>
                                        <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", pointerEvents: "none", zIndex: 20 }}>{currentIndex + 1} / {urls.length}</div>
                                    </>
                                )}

                                {/* Botón Eliminar */}
                                {editable && (
                                    <button type="button" onClick={handleEliminar} style={{ position: "absolute", top: "10px", right: "10px", background: "red", color: "white", border: "2px solid white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", zIndex: 25, boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} title="Eliminar">×</button>
                                )}
                        </div>
                    ) : (
                        // Mensaje vacío (SOLO si allowMultiple es TRUE y no hay fotos)
                        // Si es foto única, asumimos que no quieres ver un recuadro vacío
                        allowMultiple && (
                            <div style={{ width: "100%", height: "150px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "2px dashed #ddd", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", flexDirection: "column", gap: "10px" }}>
                                <span>📷 / 🎥</span>
                                <span style={{ fontSize: "0.9em" }}>No hay contenido cargado</span>
                            </div>
                        )
                    )}

                    {/* 3. LIGHTBOX (VISOR PANTALLA COMPLETA) - Siempre disponible */}
                    {archivoSeleccionado && (
                        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", animation: "fadeIn 0.2s" }} onClick={() => setArchivoSeleccionado(null)}>
                            
                            {esVideo(archivoSeleccionado) ? (
                                <video src={archivoSeleccionado} controls autoPlay style={{ maxWidth: "95%", maxHeight: "90vh", borderRadius: "4px" }} onClick={(e) => e.stopPropagation()} />
                            ) : esAudio(archivoSeleccionado) ? (
                                <div style={{ background: "white", padding: "30px", borderRadius: "10px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                    <span style={{ fontSize: "50px", display: "block", marginBottom: "20px" }}>🎵</span>
                                    <audio controls src={archivoSeleccionado} autoPlay />
                                </div>
                            ) : (
                                <img src={archivoSeleccionado} alt="Full" style={{ maxWidth: "95%", maxHeight: "90vh", borderRadius: "4px" }} onClick={(e) => e.stopPropagation()} />
                            )}

                            <button onClick={() => setArchivoSeleccionado(null)} style={{ marginTop: "20px", padding: "10px 30px", background: "white", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>Cerrar</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Multimedia;