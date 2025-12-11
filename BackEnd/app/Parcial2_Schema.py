from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from bson import ObjectId
from typing import Optional


class UsuarioCrear(BaseModel):
    id: str = Field(alias="_id")
    #email: str = Field(..., min_length=5, max_length=50)
    email: str
    fechaLogueo: datetime = Field(default_factory=datetime.utcnow)
    fechaCaducidad: datetime
    alias: Optional[str] = None
    foto: Optional[str] = None

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "UID_FIREBASE_DEL_USUARIO",
                "email": "usuario@email.com",
                "alias": "Juan",
                "foto": "https://foto.com/avatar.png",
                "fechaLogueo": "2025-12-10T12:00:00Z",
                "fechaCaducidad": "2025-12-10T13:00:00Z"
            }
        }
    }


class UsuarioActualizar(BaseModel):
    alias: Optional[str] = None
    foto: Optional[str] = None
    fechaCaducidad: Optional[datetime] = None  # por si quieres renovar la sesión

    model_config = {
        "json_schema_extra": {
            "example": {
                "alias": "NuevoAlias",
                "foto": "https://imagen.com/nueva.png",
                "fechaCaducidad": "2025-12-10T14:00:00Z"
            }
        }
    }


class UsuarioRespuesta(BaseModel):
    id: str = Field(alias="_id")
    email: str
    fechaLogueo: datetime
    fechaCaducidad: datetime
    alias: Optional[str]
    foto: Optional[str]

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "656f1a01fee6ad04b5737204",
                "email": "usuario@email.com",
                "alias": "Juan",
                "foto": "https://foto.com/avatar.png",
                "fechaLogueo": "2025-12-10T12:00:00Z",
                "fechaCaducidad": "2025-12-10T13:00:00Z"
            }
        }
    }


class Coordenada(BaseModel):
    latitud: str
    longitud: str


class Parcial2Crear(BaseModel):
    usuarioId: str = Field(..., description="UID Firebase del usuario dueño del Parcial2")
    nombre: str = Field(..., min_length=5, max_length=50)
    numero: int
    fecha: datetime = Field(default_factory=datetime.utcnow)
    booleana: bool = Field(default=False)
    coordenadas: Optional[list[Coordenada]] = None
    enlaces: Optional[list[str]] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "Mi Parcial Ejemplo",
                "numero": 42,
                "fecha": "2025-12-10T10:30:00Z",
                "booleana": True,
                "coordenadas": [
                    {"latitud": "40.123", "longitud": "-3.234"},
                    {"latitud": "41.456", "longitud": "-4.567"}
                ],
                "enlaces": ["https://ejemplo.com", "https://github.com"]
            }
        }
    }

class Parcial2Actualizar(BaseModel):
    usuarioId: Optional[str] = None
    nombre: Optional[str] = None
    numero: Optional[int] = None
    fecha: Optional[datetime] = None
    booleana: Optional[bool] = None
    coordenadas: Optional[list[Coordenada]] = None
    enlaces: Optional[list[str]] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "Nuevo nombre",
                "numero": 100,
                "fecha": "2025-12-11T11:00:00Z",
                "booleana": False,
                "coordenadas": [
                    {"latitud": "40.200", "longitud": "-3.300"}
                ],
                "enlaces": ["https://actualizado.com"]
            }
        }
    }


class Parcial2Respuesta(BaseModel):
    id: str = Field(alias="_id")
    usuarioId: str
    nombre: str
    numero: int
    fecha: datetime
    booleana: bool
    coordenadas: Optional[list[Coordenada]]
    enlaces: Optional[list[str]]

    @model_validator(mode="before")
    def convertir_id_a_str(cls, values):
        if "_id" in values and isinstance(values["_id"], ObjectId):
            values["_id"] = str(values["_id"])
        return values

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "656f1a01fee6ad04b5737204",
                "nombre": "Mi Parcial Ejemplo",
                "numero": 42,
                "fecha": "2025-12-10T12:00:00Z",
                "booleana": True,
                "coordenadas": [
                    {"latitud": "40.123", "longitud": "-3.234"}
                ],
                "enlaces": ["https://ejemplo.com"]
            }
        }
    }