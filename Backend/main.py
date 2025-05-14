from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import numpy as np
import time
from typing import List, Dict, Any, Optional
import json
import os

# Modules personnalisés pour le calcul et la mesure d'énergie
from temperature_calculator import calculate_temperature_direct, calculate_temperature_scipy
from energy_monitor import EnergyMonitor
from config import *

app = FastAPI(
    title="API de Prédiction de Température de Câble",
    description="API pour prédire la température d'un câble en fonction de la météo et de l'intensité",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes depuis le front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir les fichiers statiques (frontend)
#app.mount("/static", StaticFiles(directory="static"), name="static")

# Modèle de données pour les paramètres d'entrée
class TemperatureParams(BaseModel):
    ambient_temperature: float  # Ta (température ambiante)
    wind_speed: float          # ws (vitesse du vent)
    current_intensity: float   # I (intensité du courant)
    initial_temp: float = DEFAULT_INITIAL_TEMPERATURE  # Température initiale du câble
    method: str = DEFAULT_INTEGRATION_METHOD      # "direct" ou "scipy"

# Modèle de données pour le suivi énergétique
class EnergyData(BaseModel):
    timestamp: float
    energy_consumption_joules: float
    co2_emissions_grams: float

# Créer un moniteur d'énergie global
energy_monitor = EnergyMonitor(
    sampling_interval=ENERGY_SAMPLING_INTERVAL,
    co2_per_kwh=CO2_PER_KWH
)

# Cache pour stocker les calculs récents
calculation_cache = {}

@app.get("/")
async def read_root():
    """
    Racine de l'API - renvoie vers l'interface web statique
    """
    from fastapi.responses import FileResponse
    return FileResponse('static/index.html')

@app.post("/predict/", response_model=Dict[str, Any])
async def predict_temperature(params: TemperatureParams):
    """
    Prédit la température d'un câble pour les 30 prochaines minutes
    """
    # Vérifier si les paramètres sont dans le cache
    if ENABLE_CACHE:
        cache_key = f"{params.ambient_temperature}_{params.wind_speed}_{params.current_intensity}_{params.initial_temp}_{params.method}"
        
        if cache_key in calculation_cache:
            # Utilisation du cache pour économiser de l'énergie
            return calculation_cache[cache_key]
    
    # Démarrer le monitoring d'énergie
    energy_monitor.start_monitoring()
    
    start_time = time.time()
    
    try:
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
        
        # Arrêter le monitoring et récupérer les résultats
        energy_data = energy_monitor.stop_monitoring()
        
        # Préparer la réponse
        result = {
            "temperatures": temperatures,
            "execution_time_seconds": execution_time,
            "energy": {
                "consumption_joules": energy_data["energy_consumption_joules"],
                "co2_emissions_grams": energy_data["co2_emissions_grams"],
            },
            "timestamps": [i for i in range(31)]  # 0 à 30 minutes
        }
        
        # Mettre en cache les résultats si le cache est activé
        if ENABLE_CACHE:
            # Limiter la taille du cache
            if len(calculation_cache) >= MAX_CACHE_SIZE:
                # Supprimer une entrée aléatoire
                key_to_remove = next(iter(calculation_cache))
                calculation_cache.pop(key_to_remove)
                
            calculation_cache[cache_key] = result
        
        return result
    
    except Exception as e:
        # Arrêter le monitoring en cas d'erreur
        energy_monitor.stop_monitoring()
        raise HTTPException(status_code=500, detail=f"Erreur de calcul: {str(e)}")

@app.get("/energy/history/", response_model=List[EnergyData])
async def get_energy_history():
    """
    Récupère l'historique de consommation d'énergie
    """
    return energy_monitor.get_history()

@app.get("/compare/methods/", response_model=Dict[str, Any])
async def compare_methods(
    ambient_temperature: float,
    wind_speed: float,
    current_intensity: float,
    initial_temp: float = DEFAULT_INITIAL_TEMPERATURE
):
    """
    Compare les deux méthodes de calcul en termes de précision, de temps d'exécution et de consommation d'énergie
    """
    # Calcul avec la méthode directe
    direct_params = TemperatureParams(
        ambient_temperature=ambient_temperature,
        wind_speed=wind_speed,
        current_intensity=current_intensity,
        initial_temp=initial_temp,
        method="direct"
    )
    direct_result = await predict_temperature(direct_params)
    
    # Calcul avec la méthode scipy
    scipy_params = TemperatureParams(
        ambient_temperature=ambient_temperature,
        wind_speed=wind_speed,
        current_intensity=current_intensity,
        initial_temp=initial_temp,
        method="scipy"
    )
    scipy_result = await predict_temperature(scipy_params)
    
    # Calculer la différence maximale de température entre les deux méthodes
    temp_diff = max([abs(a - b) for a, b in zip(direct_result["temperatures"], scipy_result["temperatures"])])
    
    # Comparer les résultats
    return {
        "direct": direct_result,
        "scipy": scipy_result,
        "comparison": {
            "time_difference": direct_result["execution_time_seconds"] - scipy_result["execution_time_seconds"],
            "energy_difference": direct_result["energy"]["consumption_joules"] - scipy_result["energy"]["consumption_joules"],
            "co2_difference": direct_result["energy"]["co2_emissions_grams"] - scipy_result["energy"]["co2_emissions_grams"],
            "max_temperature_difference": temp_diff
        }
    }

@app.get("/robot/temperature/", response_model=Dict[str, Any])
async def get_current_temperature_for_robot(
    ambient_temperature: float,
    wind_speed: float,
    current_intensity: float
):
    """
    Endpoint spécifique pour les robots de contrôle, format simplifié
    """
    params = TemperatureParams(
        ambient_temperature=ambient_temperature,
        wind_speed=wind_speed,
        current_intensity=current_intensity,
        method="scipy"  # Utiliser la méthode la plus précise par défaut
    )
    
    result = await predict_temperature(params)
    
    # Format simplifié pour les robots
    return {
        "temperature_values": result["temperatures"],
        "timestamp": time.time()
    }

@app.get("/cache/info/", response_model=Dict[str, Any])
async def get_cache_info():
    """
    Informations sur l'état du cache
    """
    if not ENABLE_CACHE:
        return {
            "enabled": False,
            "size": 0,
            "max_size": MAX_CACHE_SIZE
        }
    
    return {
        "enabled": True,
        "size": len(calculation_cache),
        "max_size": MAX_CACHE_SIZE,
        "keys": list(calculation_cache.keys())
    }

@app.post("/cache/clear/")
async def clear_cache():
    """
    Vide le cache des calculs
    """
    global calculation_cache
    calculation_cache = {}
    return {"message": "Cache vidé avec succès"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)