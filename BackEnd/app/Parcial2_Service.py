from typing import Optional
from datetime import datetime, date
from zoneinfo import ZoneInfo
from app.Parcial2_Repository import Parcial2Repository
from app.Parcial2_Schema import Parcial2Crear, Parcial2Actualizar, Parcial2Respuesta, UsuarioActualizar, UsuarioRespuesta, UsuarioCrear 
from bson import ObjectId
from app.core.config import settings

# --- IMPORTAMOS CLOUDINARY ---
import cloudinary
import cloudinary.uploader
import os

# Configuramos Cloudinary usando las variables de entorno (o hardcodeado si tienes prisa, pero mejor .env)
# Nota: Para el examen, si no te carga el .env rápido, puedes poner los strings directos aquí.
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

class Parcial2Service():

    # ================================================================
    #   HELPER: Función para borrar foto de Cloudinary dado su URL
    # ================================================================
    @staticmethod
    def borrar_foto_cloudinary(url: str):
        try:
            # La URL es tipo: https://res.cloudinary.com/demo/image/upload/v123456/carpeta/mi_foto.jpg
            # El Public ID es lo que está después de 'upload/vxxxxx/' y sin la extensión.
            # Ejemplo simplificado: "carpeta/mi_foto"
            
            if "cloudinary" not in url:
                return # No es de cloudinary

            # Extraer el public_id es un poco truculento, esta es una forma rápida:
            # Rompemos la URL por partes y cogemos la última parte (nombre.jpg)
            partes = url.split("/")
            nombre_con_extension = partes[-1]
            public_id = nombre_con_extension.split(".")[0] # Quitamos .jpg
            
            # Si usas carpetas en cloudinary, el public_id incluye la carpeta. 
            # Una forma más robusta suele ser necesaria si usas carpetas, 
            # pero para subidas simples a la raíz, esto suele valer.
            
            # NOTA: Si usaste un 'upload_preset' que mete las fotos en una carpeta, 
            # el public_id debe incluir esa carpeta.
            # Truco rápido: Cloudinary devuelve el public_id al subir, lo ideal sería guardarlo en la BBDD.
            # Como solo guardamos la URL, intentaremos borrar usando el nombre de archivo.
            
            print(f"Intentando borrar imagen en Cloudinary: {public_id}")
            cloudinary.uploader.destroy(public_id)
            
        except Exception as e:
            print(f"Error borrando imagen de Cloudinary: {e}")


    #===================================================
    #               PARCIAL2 SERVICE
    #===================================================
    
    # ... (LISTAR_TODO SE MANTIENE IGUAL) ...
    @staticmethod
    async def listar_todo(
            nombre: Optional[str] = None,
            numero: Optional[int] = None,
            fechaComienzo: Optional[date] = None,
            fechaFinal: Optional[date] = None,
            booleana: Optional[bool] = None,
            usuarioId: Optional[str] = None,
        ):
        filtro = {}
        if usuarioId:
            filtro["usuarioId"] = usuarioId
        if nombre:
            filtro["nombre"] = {"$regex": nombre, "$options": "i"}
        if numero is not None:
            filtro["numero"] = numero
        if booleana is not None:
            filtro["booleana"] = booleana
        if fechaComienzo or fechaFinal:
            filtro["fecha"] = {}
            if fechaComienzo:
                filtro["fecha"]["$gte"] = datetime.combine(fechaComienzo, datetime.min.time(), tzinfo=ZoneInfo("Europe/Madrid"))
            if fechaFinal:
                filtro["fecha"]["$lte"] = datetime.combine(fechaFinal, datetime.max.time(), tzinfo=ZoneInfo("Europe/Madrid"))
    
        return await Parcial2Repository.listar_todo(filtro)


    # ... (CREAR SE MANTIENE IGUAL) ...
    @staticmethod
    async def crear(datos: Parcial2Crear):
        datos_dict = datos.model_dump()
        resultadoId = await Parcial2Repository.crear(datos_dict)
        datosRespuesta = {"_id": resultadoId, **datos_dict}
        return Parcial2Respuesta(**datosRespuesta)


    # ======= Modificar Parcial2 (CON BORRADO DE FOTO ANTIGUA) ========
    @staticmethod
    async def modificar(id: str, datos: Parcial2Actualizar):
        try:
            objetoId = ObjectId(id)
        except:
            raise ValueError("ID no válida")

        # 1. Obtenemos el objeto ORIGINAL antes de cambiarlo
        original = await Parcial2Repository.obtener_por_id(objetoId)
        if not original:
            raise ValueError("Elemento no encontrado")

        datos_dict = {k: v for k, v in datos.model_dump().items() if v is not None}

        if not datos_dict:
            raise ValueError("No hay datos para actualizar")

        # 2. Detectar si han cambiado las fotos
        # Si en los nuevos datos viene 'enlaces' y es diferente al original
        if "enlaces" in datos_dict:
            fotos_nuevas = datos_dict["enlaces"] or []
            fotos_viejas = original.get("enlaces", []) or []

            # Buscamos qué fotos estaban antes y ya no están ahora
            for foto_vieja in fotos_viejas:
                if foto_vieja not in fotos_nuevas:
                    # Si la foto vieja no está en la lista nueva, la borramos
                    Parcial2Service.borrar_foto_cloudinary(foto_vieja)

        resultado = await Parcial2Repository.modificar(objetoId, datos_dict)
        return Parcial2Respuesta(**resultado)


    # ======= Eliminar Parcial2 (CON BORRADO DE TODAS LAS FOTOS) ========
    @staticmethod
    async def eliminar_por_id(id: str):
        try:
            objetoId = ObjectId(id)
        except:
            raise ValueError("ID no válida")

        # 1. Recuperar el objeto antes de borrarlo para tener sus URLs
        elemento = await Parcial2Repository.obtener_por_id(objetoId)
        if not elemento:
            raise ValueError("No encontrado")

        # 2. Borrar las fotos de Cloudinary
        fotos = elemento.get("enlaces", [])
        if fotos:
            for foto in fotos:
                Parcial2Service.borrar_foto_cloudinary(foto)

        # 3. Borrar de la base de datos
        eliminado = await Parcial2Repository.eliminar_por_id(objetoId)
        if not eliminado:
            raise ValueError("No se pudo eliminar de la BD")


    # ... (EL RESTO DEL ARCHIVO SE MANTIENE IGUAL: OBTENER_POR_ID Y USUARIOS) ...
    @staticmethod
    async def obtener_por_id(id: ObjectId):
        try:
            objetoId = ObjectId(id)
        except:
            raise ValueError("ID no válido")
        resultado = await Parcial2Repository.obtener_por_id(objetoId)
        if not resultado:
            raise ValueError("No encontrada")
        return Parcial2Respuesta(**resultado)

    @staticmethod
    async def listar_todo_usuarios():
        return await Parcial2Repository.listar_todos_usuarios()
    
    @staticmethod
    async def crear_usuario(datos: UsuarioCrear):
        datos_dict = datos.model_dump(by_alias=True)
        resultadoId = await Parcial2Repository.crear_usuario(datos_dict)
        datosRespuesta = {"_id": resultadoId, **datos_dict}
        return UsuarioRespuesta(**datosRespuesta)

    @staticmethod
    async def modificar_usuario(id: str, datos: UsuarioActualizar):
        datos_dict = {k: v for k, v in datos.model_dump().items() if v is not None} 
        if not datos_dict:
            raise ValueError("Datos vacíos") 
        resultado = await Parcial2Repository.modificar_usuario(id, datos_dict)
        return UsuarioRespuesta(**resultado)

    @staticmethod
    async def eliminar_usuario_por_id(id: str):
        eliminado = await Parcial2Repository.eliminar_usuario_por_id(id)
        if not eliminado:
            raise ValueError("No eliminado")

    @staticmethod
    async def obtener_usuario_por_id(id: ObjectId):
        resultado = await Parcial2Repository.obtener_usuariopor_id(id)
        if not resultado:
            raise ValueError("No encontrado")
        return UsuarioRespuesta(**resultado)