import {
    Parcial2Respuesta,
    Parcial2Crear,
    Parcial2Actualizar,
    UsuarioRespuesta,
    UsuarioCrear,
    UsuarioActualizar,
} from "../esquemas/esquemas";

// Usamos la variable de entorno o localhost por defecto si falla
const API = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// ==============================
//  Listar Parcial2
// ==============================
export async function listarParcial2(params?: {
    usuarioId?: string;
    nombre?: string;
    numero?: number;
    fechaComienzo?: string;
    fechaFinal?: string;
    booleana?: boolean;
}): Promise<Parcial2Respuesta[] | null> {

    try {
        // --- CORRECCIÓN: Limpiar parámetros undefined/null ---
        const cleanParams: Record<string, string> = {};
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                // Solo añadimos al query string si tiene valor real
                if (value !== undefined && value !== null && value !== "") {
                    cleanParams[key] = String(value);
                }
            });
        }

        const query = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`${API}/Parcial2?${query}`);

        if (!response.ok) {
            console.error("Error backend en listar Parcial2");
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return null;
    }
}


// ==============================
//  Crear Parcial2
// ==============================
export async function crearParcial2(data: Parcial2Crear): Promise<Parcial2Respuesta | null> {

    try {
        const response = await fetch(`${API}/Parcial2`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("Error backend al crear Parcial2");
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return null;
    }
}


// ==============================
//  Modificar Parcial2
// ==============================
export async function modificarParcial2(
    id: string,
    data: Parcial2Actualizar
): Promise<boolean> {

    try {
        const response = await fetch(`${API}/Parcial2/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("Error backend al modificar Parcial2");
            return false;
        }

        return true;

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return false;
    }
}


// ==============================
//  Eliminar Parcial2
// ==============================
export async function eliminarParcial2(id: string): Promise<boolean> {

    try {
        const response = await fetch(`${API}/Parcial2/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            console.error("Error backend al eliminar Parcial2");
            return false;
        }

        return true;

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return false;
    }
}


// ==============================
//  Obtener por ID
// ==============================
export async function obtenerParcial2PorId(id: string): Promise<Parcial2Respuesta | null> {

    try {
        const response = await fetch(`${API}/Parcial2/${id}`);

        if (!response.ok) {
            console.error("Error backend al obtener Parcial2 por ID");
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return null;
    }
}

// ==============================
//  Listar usuarios
// ==============================
export async function listarUsuarios(): Promise<UsuarioRespuesta[] | null> {

    try {
        const response = await fetch(`${API}/Parcial2/Usuarios/`);

        if (!response.ok) {
            console.error("Error backend al listar Usuarios");
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return null;
    }
}


// ==============================
//  Crear usuario
// ==============================
export async function crearUsuario(data: UsuarioCrear): Promise<UsuarioRespuesta | null> {

    try {
        const response = await fetch(`${API}/Parcial2/Usuarios/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("Error backend al crear Usuario");
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return null;
    }
}


// ==============================
//  Modificar usuario
// ==============================
export async function modificarUsuario(
    id: string,
    data: UsuarioActualizar
): Promise<boolean> {

    try {
        const response = await fetch(`${API}/Parcial2/Usuarios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("Error backend al modificar Usuario");
            return false;
        }

        return true;

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return false;
    }
}


// ==============================
//  Eliminar usuario
// ==============================
export async function eliminarUsuario(id: string): Promise<boolean> {

    try {
        const response = await fetch(`${API}/Parcial2/Usuarios/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            console.error("Error backend al eliminar Usuario");
            return false;
        }

        return true;

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return false;
    }
}


// ==============================
//  Obtener usuario por ID
// ==============================
export async function obtenerUsuarioPorId(id: string): Promise<UsuarioRespuesta | null> {

    try {
        const response = await fetch(`${API}/Parcial2/Usuarios/${id}`);

        if (!response.ok) {
            console.error("Error backend al obtener Usuario por ID");
            return null;
        }

        return await response.json();

    } catch (err) {
        console.error("Error de conexión al backend:", err);
        return null;
    }
}