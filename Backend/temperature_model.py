import numpy as np
import time
from scipy.integrate import odeint
from codecarbon import EmissionsTracker

def cable_temperature_ode(T, t, Ta, ws, I):
    """
    Implémentation de l'équation différentielle pour la température du câble
    
    L'équation est: 60 * dTc/dt = (-ws²/1600 * 0.4 - 0.1) * (Tc - Ta - I^1.4/73785 * 130)
    
    Paramètres:
    - T: Température actuelle du câble (Tc)
    - t: Temps
    - Ta: Température ambiante
    - ws: Vitesse du vent
    - I: Intensité du courant
    """
    # Calcul du terme de convection
    convection_term = (-ws**2 / 1600 * 0.4 - 0.1)
    
    # Calcul du terme de chauffage par effet Joule
    joule_term = I**1.4 / 73785 * 130
    
    # Calcul en millisecondes
    dTdt = (1 / 60000) * convection_term * (T - Ta - joule_term)
    
    return dTdt

def calculate_temperature_scipy(ambient_temp, wind_speed, current, initial_temp=25.0, track_emissions=False):
    """
    Calcule la température avec scipy.integrate.odeint
    """
    start_time = time.time()
    tracker = EmissionsTracker()
    tracker.start()
    
    # Définir les temps pour lesquels nous voulons la solution (0 à 30 minutes)
    t = np.linspace(0, 30 * 60 * 1000, 1800)
    # Redéfinir la fonction ODE pour qu'elle soit compatible avec odeint
    def ode_func(T, t):
        return cable_temperature_ode(T, t, ambient_temp, wind_speed, current)
    
    # Résoudre l'ODE
    initial_conditions = [initial_temp]
    solution = odeint(ode_func, initial_conditions, t)

    
    # Extraire les températures (odeint renvoie un tableau différent de solve_ivp)
    temperatures = solution.flatten().tolist()
    
    tracker.stop()
    
    emissions = tracker.final_emissions_data

    return temperatures, emissions

def matrix_benchmark(matrix_size=5000):
    """
    Effectue un benchmark avec une grande matrice aléatoire
    """
    start_time = time.time()
    
    tracker = EmissionsTracker()
    tracker.start()
    # Créer une matrice aléatoire de grande taille
    matrix = np.random.random((matrix_size, matrix_size))
    
    # Effectuer quelques opérations matricielles
    result = np.dot(matrix, matrix.T)  # Produit matriciel
    
    # Pour les petites matrices, calculer aussi les valeurs propres
    if matrix_size <= 1000:
        eigenvalues = np.linalg.eigvals(matrix)
    else:
        # Pour les grandes matrices, calculer seulement quelques valeurs propres
        eigenvalues = np.linalg.eigvals(matrix[:1000, :1000])
    
    execution_time = time.time() - start_time
    memory_mb = matrix.nbytes / (1024 * 1024)
    
    tracker.stop() if tracker else None
    # Obtenir les émissions de CO2
    emissions = tracker.final_emissions_data.emissions 
    # Convertir les émissions en kg
    emissions = emissions / 1000


    return {
        "matrix_size": (matrix_size, matrix_size),
        "memory_usage_mb": memory_mb,
        "execution_time": execution_time,
        "emissions_kg": emissions
    }