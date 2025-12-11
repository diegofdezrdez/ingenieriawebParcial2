// ===============================================
// ================ USUARIO ======================
// ===============================================

export interface UsuarioCrear {
    _id: string;                // En el backend es alias "id"
    email: string;
    fechaLogueo: string;        // En el backend es datetime → string ISO
    fechaCaducidad: string;     // En el backend es datetime → string ISO
    alias?: string | null;
    foto?: string | null;
}

export interface UsuarioActualizar {
    alias?: string | null;
    foto?: string | null;
    fechaCaducidad?: string; // Puede venir undefined
}

export interface UsuarioRespuesta {
    _id: string;                // Viene desde FastAPI ya convertido a string
    email: string;
    fechaLogueo: string;
    fechaCaducidad: string;
    alias?: string | null;
    foto?: string | null;
}


// ===============================================
// ================ PARCIAL 2 =====================
// ===============================================

export interface Coordenada {
    latitud: string;
    longitud: string;
}

export interface Parcial2Crear {
    usuarioId: string;
    nombre: string;
    numero: number;
    fecha: string;                      // datetime del backend → string ISO
    booleana: boolean;
    coordenadas?: Coordenada[] | null;
    enlaces?: string[] | null;
}

export interface Parcial2Actualizar {
    usuarioId?: string;
    nombre?: string;
    numero?: number;
    fecha?: string;
    booleana?: boolean;
    coordenadas?: Coordenada[] | null;
    enlaces?: string[] | null;
}

export interface Parcial2Respuesta {
    _id: string;                        // Lo devuelve el backend como string
    usuarioId: string;
    nombre: string;
    numero: number;
    fecha: string;
    booleana: boolean;
    coordenadas?: Coordenada[] | null;
    enlaces?: string[] | null;
}
