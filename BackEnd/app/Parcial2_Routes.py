from fastapi import APIRouter, HTTPException, Path, Query, Body
from app.Parcial2_Schema import Parcial2Respuesta, Parcial2Crear, Parcial2Actualizar, UsuarioActualizar, UsuarioRespuesta, UsuarioCrear
from typing import Optional
from datetime import date
from app.Parcial2_Service import Parcial2Service

router = APIRouter(prefix="/Parcial2", tags=[])
    
# ===================================================
#                  Rutas Parcial2
# ===================================================
# ======= Listar todos los Parcial2 ========
@router.get(
    "/", tags=["CRUD"],
    response_model=list[Parcial2Respuesta],
    status_code=200,
    responses={
        200: {"description": "Lista obtenida correctamente."},
        422: {"description": "Error en formato."},
        500: {"description": "Error interno del servidor."},
    },
)
async def listar_todo(    
    nombre: Optional[str] = Query(None, description="Nombre parcial para filtrar (Ej: parcial)"),
    numero: Optional[int] = Query(None, description="Número exacto para filtrar (Ej: 22)"),
    fechaComienzo: Optional[date] = Query(None, description="Fecha de inicio del rango (YYYY-MM-DD)"),
    fechaFinal: Optional[date] = Query(None, description="Fecha de fin del rango (YYYY-MM-DD)"),
    booleana: Optional[bool] = Query(None, description="Valor booleano a filtrar (true/false)"),
    usuarioId: Optional[str] = Query(None, description="UID Firebase del usuario dueño del Parcial2"),
    ):

    return await Parcial2Service.listar_todo(nombre, numero, fechaComienzo, fechaFinal, booleana, usuarioId)



# ======= Crear Parcial2 ========
@router.post(
    "/", tags=["CRUD"],
    response_model=Parcial2Respuesta,
    status_code=201,
    responses={
        201: {"description": "creado correctamente."},
        422: {"description": "Error de validación en los datos enviados."},
        500: {"description": "Error interno del servidor."},
    },
)
async def crear_comentario(datos: Parcial2Crear):
    try:
        return await Parcial2Service.crear(datos)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ======= Modificar Parcial2 ========
@router.put(
    "/{id}", tags=["CRUD"],
    response_model=Parcial2Respuesta,
    status_code=200,
    responses={
        200: {"description": "Actualizado correctamente."},
        404: {"description": "Parcial2 no encontrada."},
        422: {"description": "Error de validación en los datos enviados."},
        500: {"description": "Error interno del servidor."},
    },
)
async def modificar(
    datos: Parcial2Actualizar,
    id: str = Path(
        description="El ID (ObjectId de MongoDB) de la Parcial2 a modificar.",
        example="70fa1a01fee6ad04b5737208",
    ),
):
    try:
        return await Parcial2Service.modificar(id, datos)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ======= Eliminar comentario ========
@router.delete(
    "/{id}", tags=["CRUD"],
    status_code=204,  # No Content
    responses={
        204: {"description": "Parcial2 eliminado correctamente."},
        404: {"description": "Parcial2 no encontrado."},
        422: {"description": "ID con formato inválido."},
        500: {"description": "Error interno del servidor."},
    },
)
async def eliminar_por_id(
    id: str = Path(
        description="El ID (ObjectId de MongoDB) de la Parcial2 a eliminar.",
        example="70fa1a01fee6ad04b5737208",
    )
):
    try:
        await Parcial2Service.eliminar_por_id(id)
        # No devolvemos contenido, cumple con el 204
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ======= Obtener comentario por id ========
@router.get(
    "/{id}", tags=["CRUD"],
    response_model=Parcial2Respuesta,
    status_code=200,
    responses={
        200: {"description": "Parcial2 encontrado correctamente."},
        404: {"description": "Parcial2 no encontrado."},
        422: {"description": "ID con formato inválido."},
        500: {"description": "Error interno del servidor."},
    },
)
async def obtener_por_id(
    id: str = Path(
        description="El ID (ObjectId de MongoDB) de la Parcial2 a buscar.",
        example="70fa1a01fee6ad04b5737202",
    )
):
    try:
        return await Parcial2Service.obtener_por_id(id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ===================================================
#                  Rutas Usuario
# ===================================================
    
# ======= Listar todos los Usuario ========
@router.get(
    "/Usuarios/", tags=["CRUD Usuarios"],
    response_model=list[UsuarioRespuesta],
    status_code=200,
    responses={
        200: {"description": "Lista obtenida correctamente."},
        422: {"description": "Error en formato."},
        500: {"description": "Error interno del servidor."},
    },
)
async def listar_todo_usuarios():

    return await Parcial2Service.listar_todo_usuarios()



# ======= Crear Usuario ========
@router.post(
    "/Usuarios/", tags=["CRUD Usuarios"],
    response_model=UsuarioRespuesta,
    status_code=201,
    responses={
        201: {"description": "creado correctamente."},
        422: {"description": "Error de validación en los datos enviados."},
        500: {"description": "Error interno del servidor."},
    },
)
async def crear_usuario(datos: UsuarioCrear):
    try:
        return await Parcial2Service.crear_usuario(datos)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ======= Modificar Usuario ========
@router.put(
    "/Usuarios/{id}", tags=["CRUD Usuarios"],
    response_model=UsuarioRespuesta,
    status_code=200,
    responses={
        200: {"description": "Actualizado correctamente."},
        404: {"description": "Usuario no encontrada."},
        422: {"description": "Error de validación en los datos enviados."},
        500: {"description": "Error interno del servidor."},
    },
)
async def modificar_usuario(
    datos: UsuarioActualizar,
    id: str = Path(
        description="El ID (ObjectId de MongoDB) del Usuario a modificar.",
        example="70fa1a01fee6ad04b5737208",
    ),
):
    try:
        return await Parcial2Service.modificar_usuario(id, datos)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ======= Eliminar Usuario ========
@router.delete(
    "/Usuarios/{id}", tags=["CRUD Usuarios"],
    status_code=204,  # No Content
    responses={
        204: {"description": "Usuario eliminado correctamente."},
        404: {"description": "Usuario no encontrado."},
        422: {"description": "ID con formato inválido."},
        500: {"description": "Error interno del servidor."},
    },
)
async def eliminar_usuario_por_id(
    id: str = Path(
        description="El ID (ObjectId de MongoDB) del Usuario a eliminar.",
        example="70fa1a01fee6ad04b5737208",
    )
):
    try:
        await Parcial2Service.eliminar_usuario_por_id(id)
        # No devolvemos contenido, cumple con el 204
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ======= Obtener Usuario por id ========
@router.get(
    "/Usuarios/{id}", tags=["CRUD Usuarios"],
    response_model=UsuarioRespuesta,
    status_code=200,
    responses={
        200: {"description": "Usuario encontrado correctamente."},
        404: {"description": "Usuario no encontrado."},
        422: {"description": "ID con formato inválido."},
        500: {"description": "Error interno del servidor."},
    },
)
async def obtener_usuario_por_id(
    id: str = Path(
        description="El ID (ObjectId de MongoDB) del Usuario a buscar.",
        example="70fa1a01fee6ad04b5737202",
    )
):
    try:
        return await Parcial2Service.obtener_usuario_por_id(id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

