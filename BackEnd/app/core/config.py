from pydantic_settings import BaseSettings
from environs import Env

env = Env()
env.read_env()

class Settings(BaseSettings):
    MONGO_URI: str = env('MONGO_URI')
    CLASE1_URL: str = env('CLASE1_URL')
    DB_NAME: str = "Parcial2_2025"

settings = Settings()