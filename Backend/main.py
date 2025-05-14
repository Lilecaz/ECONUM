from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import time
from typing import List, Dict, Any
from temperature_model import calculate_temperature_direct, calculate_temperature_scipy

app = FastAPI(title="API de Prédiction de Température de Câble")

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir les fichiers statiques pour l'interface web
app.mount("/static", StaticFiles(directory="../Frontend/static"), name="static")
# Modèle de données pour les paramètres d'entrée
class TemperatureParams(BaseModel):
    ambient_temperature: float  # Ta (température ambiante)
    wind_speed: float          # ws (vitesse du vent)
    current_intensity: float   # I (intensité du courant)
    initial_temp: float = 25.0  # Température initiale du câble
    method: str = "scipy"      # "direct" ou "scipy"

@app.get("/")
async def read_root():
    """Page d'accueil - renvoie l'interface utilisateur statique"""
    from fastapi.responses import FileResponse
    return FileResponse('../Frontend/static/index.html')

@app.post("/predict/", response_model=Dict[str, Any])
async def predict_temperature(params: TemperatureParams):
    """
    Prédit la température d'un câble pour les 30 prochaines minutes
    """
    start_time = time.time()
    
    try:
        # Choisir la méthode de calcul appropriée
        if params.method == "direct":
            temperatures = calculate_temperature_direct(
                params.ambient_temperature,
                params.wind_speed,
                params.current_intensity,
                params.initial_temp
            )
        elif params.method == "scipy":
            temperatures = calculate_temperature_scipy(
                params.ambient_temperature,
                params.wind_speed,
                params.current_intensity,
                params.initial_temp
            )
        else:
            raise HTTPException(status_code=400, detail="Méthode inconnue. Utilisez 'direct' ou 'scipy'.")
        
        execution_time = time.time() - start_time
        
        # Préparer la réponse
        result = {
            "temperatures": temperatures,
            "execution_time_seconds": execution_time,
            "timestamps": [i for i in range(31)]  # 0 à 30 minutes
        }
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de calcul: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)