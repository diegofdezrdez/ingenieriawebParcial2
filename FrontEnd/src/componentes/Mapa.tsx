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
  // Para poder centrar el mapa desde el buscador del Home
  centroExterno?: { lat: number, lon: number } | null; 
}

const Mapa: React.FC<MapaProps> = ({ 
    savedCoordinates = [],
    onMapClick,
    editable = false,
    centroExterno = null 
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
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js"; 
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

  // 3. CAMBIO: Escuchar cambios en centroExterno para mover el mapa O RESTAURARLO
  useEffect(() => {
    if (mapInstance.current && window.OpenLayers) {
        const OpenLayers = window.OpenLayers;
        
        let lat = DEFAULT_LAT;
        let lon = DEFAULT_LON;
        let zoom = 12; // Zoom por defecto

        // Si hay un centro externo definido (búsqueda activa), usamos esas coordenadas
        if (centroExterno) {
            lat = centroExterno.lat;
            lon = centroExterno.lon;
            zoom = 15; // Zoom más cercano al buscar
        } 

        const lonLat = new OpenLayers.LonLat(lon, lat)
            .transform(new OpenLayers.Projection("EPSG:4326"), mapInstance.current.getProjectionObject());
        
        mapInstance.current.setCenter(lonLat, zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroExterno]); // Se ejecuta cuando centroExterno cambia (a coordenadas o a null)

  // ===================================================================
  // === FIXES DE RENDERIZADO Y SCROLL =================================
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
        attribution: false 
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

            setTempMarkerPos({ lat: transformed.lat, lon: transformed.lon });
            
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

      // 1. Dibujar marcadores YA GUARDADOS
      savedCoordinates.forEach(coord => {
        // Parseamos a float para seguridad
        const lat = parseFloat(coord.latitud);
        const lon = parseFloat(coord.longitud);

        if (!isNaN(lat) && !isNaN(lon)) {
            const lonLat = new OpenLayers.LonLat(lon, lat)
                .transform(new OpenLayers.Projection("EPSG:4326"), projection);
            markersLayer.current.addMarker(new OpenLayers.Marker(lonLat));
        }
      });

      // 2. Dibujar marcador TEMPORAL
      if (tempMarkerPos && editable) {
        const lonLat = new OpenLayers.LonLat(tempMarkerPos.lon, tempMarkerPos.lat)
            .transform(new OpenLayers.Projection("EPSG:4326"), projection);
        
        const size = new OpenLayers.Size(32, 32); 
        const offset = new OpenLayers.Pixel(-(size.w / 2), -size.h); 
        const icon = new OpenLayers.Icon(pinIcon, size, offset);

        markersLayer.current.addMarker(new OpenLayers.Marker(lonLat, icon));
      }
  };


  return (
    <div style={{ width: "100%", marginBottom: "0" }}>
      <div 
        ref={mapDivRef}
        style={{ 
          width: "100%", 
          height: "350px", 
          border: "1px solid #ccc",
          borderRadius: "8px", 
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