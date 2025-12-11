from fastapi import FastAPI
from app.Parcial2_Routes import router as parcial2_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title="Parcial Server - Servicio de Parcial2",
    version="1.0.0"
)

app.include_router(parcial2_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pon aquí tu dominio si quieres restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)