from app.core.database import db
from bson import ObjectId

class Parcial2Repository:
    
    #===================================================
    #               PARCIAL2 REPOSITORY
    #===================================================
    # ======= Listar todos los Parcial2 ========
    @staticmethod
    async def listar_todo(filtro: dict):
        resultados = await db.Parcial2.find(filtro).to_list(100)
        return resultados

    # ======= Crear Parcial2 ========
    @staticmethod
    async def crear(datos: dict):
        resultado = await db.Parcial2.insert_one(datos)
        return resultado.inserted_id


    # ======= Modificar Parcial2 ========
    @staticmethod
    async def modificar(id: ObjectId, datos: dict):
        await db.Parcial2.update_one({"_id": id}, {"$set": datos})
        return await db.Parcial2.find_one({"_id": id})


    # ======= Eliminar Parcial2 ========
    @staticmethod
    async def eliminar_por_id(id: ObjectId):
        resultado = await db.Parcial2.delete_one({"_id": id})
        return resultado.deleted_count > 0


    # ======= Obtener Parcial2 por id ========
    @staticmethod
    async def obtener_por_id(id: ObjectId):
        return await db.Parcial2.find_one({"_id": id})

    #===================================================
    #               USUARIO REPOSITORY
    #===================================================

    # ======= Listar todos los Usuario ========
    @staticmethod
    async def listar_todos_usuarios():
        resultados = await db.Usuario.find().to_list(100)
        return resultados

    # ======= Crear Usuario ========
    @staticmethod
    async def crear_usuario(datos: dict):
        resultado = await db.Usuario.insert_one(datos)
        return resultado.inserted_id


    # ======= Modificar Usuario ========
    @staticmethod
    async def modificar_usuario(id: ObjectId, datos: dict):
        await db.Usuario.update_one({"_id": id}, {"$set": datos})
        return await db.Usuario.find_one({"_id": id})


    # ======= Eliminar Usuario ========
    @staticmethod
    async def eliminar_usuario_por_id(id: ObjectId):
        resultado = await db.Usuario.delete_one({"_id": id})
        return resultado.deleted_count > 0


    # ======= Obtener Usuario por id ========
    @staticmethod
    async def obtener_usuariopor_id(id: ObjectId):
        return await db.Usuario.find_one({"_id": id})