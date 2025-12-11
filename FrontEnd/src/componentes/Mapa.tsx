import React, { useEffect, useRef, useState } from 'react';
// Importamos la imagen del pin. Webpack/React se encarga de la ruta final.
import pinIcon from '../imagenes/pin.png'; 

declare global {
  interface Window {
    OpenLayers: any;
  }
}

interface MapaProps {
  // Coordenadas YA guardadas (se mostrarán con marcador estándar)
  savedCoordinates?: { latitud: string; longitud: string }[];
  // Acción al hacer clic en el mapa (para poner el pin temporal)
  onMapClick?: (lat: number, lon: number) => void;
  editable?: boolean; 
}

const Mapa: React.FC<MapaProps> = ({ 
    savedCoordinates = [],
    onMapClick,
    editable = false 
}) => {
  
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  // Estado para el marcador temporal (el pin rojo donde acabamos de hacer clic)
  const [tempMarkerPos, setTempMarkerPos] = useState<{lat: number, lon: number} | null>(null);

  const DEFAULT_LAT = 36.7213; 
  const DEFAULT_LON = -4.4216;

  // 1. Cargar script OpenLayers
  useEffect(() => {
    if (window.OpenLayers) {
      iniciarMapa();
      return;
    }
    const scriptId = 'openlayers-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "http://www.openlayers.org/api/OpenLayers.js"; 
      script.async = true;
      script.onload = () => iniciarMapa();
      document.body.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Actualizar marcadores cuando cambian las props o el estado temporal
  useEffect(() => {
    if (window.OpenLayers && mapInstance.current && markersLayer.current) {
        actualizarMarcadores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCoordinates, tempMarkerPos]);

  // ===================================================================
  // === FIXES DE RENDERIZADO Y SCROLL (Igual que antes) ===============
  // ===================================================================
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => mapInstance.current.updateSize(), 50);
    }
  }, []);

  useEffect(() => {
    const div = mapDivRef.current;
    if (!div) return;
    const handleWheel = (e: WheelEvent) => e.preventDefault();
    const enter = () => div.addEventListener("wheel", handleWheel, { passive: false });
    const leave = () => div.removeEventListener("wheel", handleWheel);
    div.addEventListener("mouseenter", enter);
    div.addEventListener("mouseleave", leave);
    return () => {
      div.removeEventListener("mouseenter", enter);
      div.removeEventListener("mouseleave", leave);
      div.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // --- INICIALIZACIÓN ---
  const iniciarMapa = () => {
    if (!mapDivRef.current || !window.OpenLayers || mapInstance.current) return;

    mapDivRef.current.innerHTML = '';
    const OpenLayers = window.OpenLayers;

    const mapOptions = {
        controls: [new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanZoom()],
        numZoomLevels: 20,
        attribution: false // Intentar quitar atribución
    };

    const map = new OpenLayers.Map(mapDivRef.current, mapOptions);
    map.addLayer(new OpenLayers.Layer.OSM());

    const markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);

    mapInstance.current = map;
    markersLayer.current = markers;

    // Centrar el mapa inicialmente
    const lonLat = new OpenLayers.LonLat(DEFAULT_LON, DEFAULT_LAT)
        .transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
    map.setCenter(lonLat, 12);

    // --- REGISTRO DE CLIC ---
    if (editable) {
        map.events.register("click", map, function(e: any) {
            const lonlatPx = map.getLonLatFromPixel(e.xy);
            const transformed = lonlatPx.clone().transform(
                map.getProjectionObject(), 
                new OpenLayers.Projection("EPSG:4326")
            );

            // 1. Actualizamos el estado interno para mover el pin rojo
            setTempMarkerPos({ lat: transformed.lat, lon: transformed.lon });
            
            // 2. Avisamos al padre de las nuevas coordenadas candidatas
            if (onMapClick) {
                onMapClick(transformed.lat, transformed.lon);
            }
        });
    }
    actualizarMarcadores();
  };

  // --- DIBUJAR MARCADORES ---
  const actualizarMarcadores = () => {
      const OpenLayers = window.OpenLayers;
      if (!OpenLayers || !markersLayer.current || !mapInstance.current) return;

      markersLayer.current.clearMarkers();
      const projection = mapInstance.current.getProjectionObject();

      // 1. Dibujar marcadores YA GUARDADOS (Azules estándar)
      savedCoordinates.forEach(coord => {
        const lonLat = new OpenLayers.LonLat(parseFloat(coord.longitud), parseFloat(coord.latitud))
            .transform(new OpenLayers.Projection("EPSG:4326"), projection);
        // Marcador por defecto de OpenLayers
        markersLayer.current.addMarker(new OpenLayers.Marker(lonLat));
      });

      // 2. Dibujar marcador TEMPORAL (Pin Rojo personalizado)
      if (tempMarkerPos && editable) {
        const lonLat = new OpenLayers.LonLat(tempMarkerPos.lon, tempMarkerPos.lat)
            .transform(new OpenLayers.Projection("EPSG:4326"), projection);
        
        // Configuración del icono personalizado
        const size = new OpenLayers.Size(32, 32); // Tamaño del icono
        const offset = new OpenLayers.Pixel(-(size.w / 2), -size.h); // El punto de anclaje (centro abajo)
        const icon = new OpenLayers.Icon(pinIcon, size, offset);

        markersLayer.current.addMarker(new OpenLayers.Marker(lonLat, icon));
      }
  };


  return (
    <div style={{ width: "100%", marginBottom: "0" }}>
        {/* SE HAN ELIMINADO EL BUSCADOR Y EL TEXTO INFERIOR */}
      <div 
        ref={mapDivRef}
        style={{ 
          width: "100%", 
          height: "300px",  // Un poco más alto ahora que no tiene cosas alrededor
          border: "1px solid #ccc",
          borderRadius: "8px", // Bordes redondeados completos
          backgroundColor: "#f0f0f0",
          overflow: "hidden", 
          position: "relative",
          cursor: editable ? "crosshair" : "default"
        }} 
      />
    </div>
  );
};

export default Mapa;