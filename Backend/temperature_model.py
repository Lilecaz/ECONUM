import numpy as np
import time
from scipy.integrate import odeint

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
    
    # Calcul de la variation de température
    dTdt = (1 / 60) * convection_term * (T - Ta - joule_term)
    
    return dTdt

def calculate_temperature_scipy(ambient_temp, wind_speed, current, initial_temp=25.0, track_emissions=False):
    """
    Calcule la température avec scipy.integrate.odeint
    """
    start_time = time.time()
    
    # Définir les temps pour lesquels nous voulons la solution (0 à 30 minutes)
    t = np.linspace(0, 30 * 60, 31)  # 31 points (0 à 30 min), en secondes
    
    # Redéfinir la fonction ODE pour qu'elle soit compatible avec odeint
    def ode_for_odeint(y, t):
        return cable_temperature_ode(y, t, ambient_temp, wind_speed, current)
    
    # Résoudre l'équation différentielle avec odeint
    solution = odeint(
        ode_for_odeint,     # Fonction d'équation différentielle
        initial_temp,       # Condition initiale
        t,                  # Points temporels pour l'évaluation
        rtol=1e-6,          # Tolérance relative
        atol=1e-9           # Tolérance absolue
    )
    
    # Extraire les températures (odeint renvoie un tableau différent de solve_ivp)
    temperatures = solution.flatten().tolist()
    
    execution_time = time.time() - start_time
    
    # Émissions simulées
    simulated_emissions = execution_time * 0.0002  # Estimation factice
    
    return temperatures, simulated_emissions

def matrix_benchmark(matrix_size=5000, track_emissions=False):
    """
    Effectue un benchmark avec une grande matrice aléatoire
    """
    start_time = time.time()
    
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
    
    # Émissions simulées
    simulated_emissions = execution_time * memory_mb * 0.0001  # Estimation factice
    
    return {
        "matrix_size": (matrix_size, matrix_size),
        "memory_usage_mb": memory_mb,
        "execution_time": execution_time,
        "emissions_kg": simulated_emissions
    }