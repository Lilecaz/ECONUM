from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import time
from typing import List, Dict, Any, Optional
import numpy as np
from scipy import integrate
import os


# Créer le dossier static s'il n'existe pas
if not os.path.exists('static'):
    os.makedirs('static')
    # Créer un fichier index.html minimal si nécessaire
    with open('static/index.html', 'w') as f:
        f.write("<html><body><h1>API de Prédiction de Température de Câble</h1></body></html>")

# Importer les fonctions de calcul
from temperature_model import calculate_temperature_scipy, matrix_benchmark

app = FastAPI(title="API de Prédiction de Température de Câble")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle de données
class TemperatureParams(BaseModel):
    ambient_temperature: float  # Ta (température ambiante)
    wind_speed: float          # ws (vitesse du vent)
    current_intensity: float   # I (intensité du courant)
    initial_temp: float = 25.0  # Température initiale du câble
    method: str = "scipy"      # "direct" ou "scipy"

@app.get("/")
async def read_root():
    """Page d'accueil"""
    from fastapi.responses import FileResponse
    return FileResponse('../Frontend/static/index.html')

@app.post("/predict/", response_model=Dict[str, Any])
async def predict_temperature(params: TemperatureParams):
    """
    Prédit la température d'un câble pour les 30 prochaines minutes
    """
    start_time = time.time()
    
    try:
        # Choisir la méthode de calcul
        if params.method == "scipy":
            temperatures, emissions = calculate_temperature_scipy(
                params.ambient_temperature,
                params.wind_speed,
                params.current_intensity,
                params.initial_temp
            )
        else:
            raise HTTPException(status_code=400, detail="Méthode inconnue. Utilisez 'direct' ou 'scipy'.")
        
        execution_time = time.time() - start_time
        
        # Préparer la réponse
        # Générer les timestamps en millisecondes pour chaque température
        timestamps = [int(i * 60 * 1000) for i in range(len(temperatures))]
        result = {
            "temperatures": temperatures,
            "execution_time_seconds": execution_time,
            "timestamps": timestamps,
            "carbon_emissions_kg": emissions,
            "note": "Les émissions de CO2 sont des estimations simplifiées"
        }
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de calcul: {str(e)}")

@app.get("/benchmark/matrix/", response_model=Dict[str, Any])
async def run_matrix_benchmark(size: int = 5000):
    """
    Exécute un benchmark avec une grande matrice aléatoire
    """
    if size > 10000:
        size = 10000  # Limiter la taille
    
    try:
        start_time = time.time()
        
        # Effectuer le benchmark
        result = matrix_benchmark(matrix_size=size)
        
        execution_time = time.time() - start_time
        
        return {
            "matrix_size": result["matrix_size"],
            "memory_usage_mb": result["memory_usage_mb"],
            "execution_time_seconds": execution_time,
            "carbon_emissions_kg": result["emissions_kg"],
            "note": "Les émissions de CO2 sont des estimations simplifiées"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du benchmark: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Démarrage du serveur sur http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)