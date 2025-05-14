import numpy as np
from scipy import integrate
import time

def cable_temperature_ode(T, t, Ta, ws, I):
    """
    Équation différentielle pour la température du câble
    60 * dTc/dt = (-ws²/1600 * 0.4 - 0.1) * (Tc - Ta - I^1.4/73785 * 130)
    """
    # Terme de convection
    convection_term = (-ws**2 / 1600 * 0.4 - 0.1)
    
    # Terme de chauffage par effet Joule
    joule_term = I**1.4 / 73785 * 130
    
    # Calcul de la variation de température
    dTdt = (1 / 60) * convection_term * (T - Ta - joule_term)
    
    return dTdt

def calculate_temperature_direct(ambient_temp, wind_speed, current, initial_temp=25.0, track_emissions=False):
    """
    Calcule la température avec la méthode d'Euler simple
    """
    start_time = time.time()
    
    # Temps total en secondes (30 minutes)
    t_total = 30 * 60
    
    # Pas de temps en microsecondes
    dt = 1e-6
    
    # Stocker les températures pour chaque minute
    temperatures = [initial_temp]
    
    # Température courante
    T_current = initial_temp
    
    # Pour chaque minute, calculer la température
    for minute in range(1, 31):
        # Temps cible en secondes
        t_target = minute * 60
        
        # Nombre d'itérations pour cette minute
        n_iter_minute = int(t_target / dt) - int((minute - 1) * 60 / dt)
        
        # Intégration directe pour cette minute
        for _ in range(n_iter_minute):
            # Calculer la dérivée
            dTdt = cable_temperature_ode(T_current, None, ambient_temp, wind_speed, current)
            
            # Mettre à jour la température (méthode d'Euler)
            T_current += dTdt * dt
        
        # Ajouter la température à la fin de la minute
        temperatures.append(T_current)
    
    execution_time = time.time() - start_time
    
    # Émissions simulées (puisque codecarbon n'est pas disponible)
    simulated_emissions = execution_time * 0.0001  # Estimation factice
    
    return temperatures, simulated_emissions

def calculate_temperature_scipy(ambient_temp, wind_speed, current, initial_temp=25.0, track_emissions=False):
    """
    Calcule la température avec scipy.integrate.solve_ivp
    """
    start_time = time.time()
    
    # Définir les temps pour lesquels nous voulons la solution (0 à 30 minutes)
    t = np.linspace(0, 30 * 60, 31)  # 31 points (0 à 30 min), en secondes
    
    # Résoudre l'équation différentielle
    solution = integrate.solve_ivp(
        lambda t, y: cable_temperature_ode(y, t, ambient_temp, wind_speed, current),
        [0, 30 * 60],  # Intervalle de temps [0, 1800] secondes
        [initial_temp],  # Condition initiale
        t_eval=t,  # Points d'évaluation
        method='RK45',  # Méthode de Runge-Kutta d'ordre 4-5
        rtol=1e-6,  # Tolérance relative
        atol=1e-9,  # Tolérance absolue
    )
    
    # Extraire les températures
    temperatures = solution.y[0].tolist()
    
    execution_time = time.time() - start_time
    
    # Émissions simulées (puisque codecarbon n'est pas disponible)
    simulated_emissions = execution_time * 0.0002  # Estimation factice, légèrement plus haute que la méthode directe
    
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
    simulated_emissions = execution_time * memory_mb * 0.0001  # Estimation factice basée sur le temps et la taille
    
    return {
        "matrix_size": (matrix_size, matrix_size),
        "memory_usage_mb": memory_mb,
        "execution_time": execution_time,
        "emissions_kg": simulated_emissions
    }