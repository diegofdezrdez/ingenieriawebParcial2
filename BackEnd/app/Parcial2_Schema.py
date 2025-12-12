from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from bson import ObjectId
from typing import Optional

# ===============================================
#  Clases Auxiliares
# ===============================================
class Coordenada(BaseModel):
    latitud: str
    longitud: str

# ===============================================
#  USUARIOS
# ===============================================
class UsuarioCrear(BaseModel):
    id: str = Field(alias="_id")
    email: str
    fechaLogueo: datetime = Field(default_factory=datetime.utcnow)
    fechaCaducidad: datetime
    alias: Optional[str] = None
    foto: Optional[str] = None

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "_id": "UID_USER",
                "email": "user@example.com",
                "fechaCaducidad": "2025-12-12T12:00:00Z"
            }
        }
    }

class UsuarioActualizar(BaseModel):
    alias: Optional[str] = None
    foto: Optional[str] = None
    fechaCaducidad: Optional[datetime] = None

class UsuarioRespuesta(BaseModel):
    id: str = Field(alias="_id")
    email: str
    fechaLogueo: datetime
    fechaCaducidad: datetime
    alias: Optional[str]
    foto: Optional[str]
    model_config = {"populate_by_name": True}


# ===============================================
#  RESEÑAS (Parcial2)
# ===============================================

class Parcial2Crear(BaseModel):
    # --- Identificación básica ---
    usuarioId: str = Field(..., description="UID del usuario en la app")
    
    # --- Datos del Establecimiento ---
    nombre: str = Field(..., min_length=1, max_length=100)
    direccion: str = Field(..., min_length=1)
    
    # --- Datos de la Reseña ---
    valoracion: int = Field(..., ge=0, le=5)
    fecha: datetime = Field(default_factory=datetime.utcnow)
    
    # Coordenadas y Enlaces opcionales
    coordenadas: Optional[list[Coordenada]] = None
    enlaces: Optional[list[str]] = None 
    
    # --- Datos de Autoría/Token ---
    # CAMBIO: Usamos str para evitar errores de validación con el formato de Firebase
    autor_email: str
    autor_nombre: str
    token_id: str        
    token_emision: str   
    token_caducidad: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "usuarioId": "user123",
                "nombre": "Casa Lola",
                "direccion": "Calle Granada 46, Málaga",
                "valoracion": 4,
                "coordenadas": [{"latitud": "36.722", "longitud": "-4.418"}],
                "autor_email": "pepe@gmail.com",
                "autor_nombre": "Pepe",
                "token_id": "eyJhbGciOi...",
                "token_emision": "Fri, 12 Dec 2025...",
                "token_caducidad": "Fri, 12 Dec 2025..."
            }
        }
    }

class Parcial2Actualizar(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    valoracion: Optional[int] = Field(None, ge=0, le=5)
    coordenadas: Optional[list[Coordenada]] = None
    enlaces: Optional[list[str]] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "Casa Lola (Centro)",
                "valoracion": 5
            }
        }
    }

class Parcial2Respuesta(BaseModel):
    id: str = Field(alias="_id")
    usuarioId: str
    
    nombre: str
    direccion: str
    valoracion: int
    fecha: datetime
    coordenadas: Optional[list[Coordenada]]
    enlaces: Optional[list[str]]
    
    # Datos Token (Como string para visualizarlos tal cual vienen)
    autor_email: str
    autor_nombre: str
    token_id: str
    token_emision: str
    token_caducidad: str

    @model_validator(mode="before")
    def convertir_id_a_str(cls, values):
        if "_id" in values and isinstance(values["_id"], ObjectId):
            values["_id"] = str(values["_id"])
        return values

    model_config = {
        "populate_by_name": True
    }