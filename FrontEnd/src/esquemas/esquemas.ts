// ===============================================
// ================ USUARIO ======================
// ===============================================

export interface UsuarioCrear {
    _id: string;
    email: string;
    fechaLogueo: string;
    fechaCaducidad: string;
    alias?: string | null;
    foto?: string | null;
}

export interface UsuarioActualizar {
    alias?: string | null;
    foto?: string | null;
    fechaCaducidad?: string;
}

export interface UsuarioRespuesta {
    _id: string;
    email: string;
    fechaLogueo: string;
    fechaCaducidad: string;
    alias?: string | null;
    foto?: string | null;
}


// ===============================================
// ================ RESEÑAS (Antes Parcial2) =====
// ===============================================

export interface Coordenada {
    latitud: string;
    longitud: string;
}

export interface Parcial2Crear {
    usuarioId: string;
    
    // Datos del Establecimiento
    nombre: string;
    direccion: string;
    valoracion: number; // 0 a 5
    
    fecha: string;
    coordenadas?: Coordenada[] | null;
    enlaces?: string[] | null;

    // Datos de Autoría y Token
    autor_email: string;
    autor_nombre: string;
    token_id: string;
    token_emision: string;
    token_caducidad: string;
}

export interface Parcial2Actualizar {
    nombre?: string;
    direccion?: string;
    valoracion?: number;
    coordenadas?: Coordenada[] | null;
    enlaces?: string[] | null;
}

export interface Parcial2Respuesta {
    _id: string;
    usuarioId: string;
    
    nombre: string;
    direccion: string;
    valoracion: number;
    fecha: string;
    
    coordenadas?: Coordenada[] | null;
    enlaces?: string[] | null;

    // Datos extra para el detalle
    autor_email: string;
    autor_nombre: string;
    token_id: string;
    token_emision: string;
    token_caducidad: string;
}