/**
 * Servicio para manejar la subida de imágenes a Cloudinary
 * Configurado para Create React App
 */

// 1. Accedemos a las variables de entorno usando process.env
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const PRESET_UPLOAD = process.env.REACT_APP_CLOUDINARY_PRESET;


// Definimos la respuesta que esperamos de Cloudinary
// Nota: Las propiedades internas (secure_url, public_id) se mantienen en inglés
// porque así es como las devuelve la API de Cloudinary.
interface RespuestaCloudinary {
  secure_url: string; // La URL https
  public_id: string;  // El ID único de la imagen
  created_at: string;
  bytes: number;
  [key: string]: any;
}

/**
 * Sube un archivo individual a Cloudinary.
 * @param archivo El archivo seleccionado por el usuario.
 * @returns La URL pública (secure_url) de la imagen.
 */
export const subirACloudinary = async (archivo: File): Promise<string> => {
  // Validación básica
  if (!CLOUD_NAME || !PRESET_UPLOAD) {
    throw new Error('Faltan configurar las variables de entorno REACT_APP_CLOUDINARY...');
  }

  const datosFormulario = new FormData();
  datosFormulario.append('file', archivo);
  datosFormulario.append('upload_preset', PRESET_UPLOAD);

  try {
    const respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: datosFormulario,
      }
    );

    if (!respuesta.ok) {
      const detalleError = await respuesta.json();
      throw new Error(detalleError.error?.message || 'Error desconocido al subir imagen');
    }

    const datos: RespuestaCloudinary = await respuesta.json();

    // Retornamos la URL segura.
    return datos.secure_url;

  } catch (error) {
    console.error('Error en ServicioMultimedia:', error);
    throw error;
  }
};

/**
 * Sube múltiples archivos simultáneamente.
 * @param archivos Lista de archivos (FileList o array de File)
 * @returns Array de strings con las URLs
 */
export const subirMultiplesImagenes = async (archivos: FileList | File[]): Promise<string[]> => {
  // Convertimos FileList a Array normal para poder usar map
  const listaArchivos = Array.from(archivos);

  // Creamos un array de promesas (todas las subidas se inician a la vez)
  const promesasSubida = listaArchivos.map((archivo) => subirACloudinary(archivo));

  // Esperamos a que TODAS terminen
  const urls = await Promise.all(promesasSubida);
  
  return urls;
};