import numpy as np
from scipy import integrate
import time

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

def calculate_temperature_direct(ambient_temp, wind_speed, current, initial_temp=25.0):
    """
    Calcule la température du câble pour les 30 prochaines minutes avec une méthode d'intégration directe
    en utilisant la méthode d'Euler.
    
    Paramètres:
    - ambient_temp: Température ambiante (Ta)
    - wind_speed: Vitesse du vent (ws)
    - current: Intensité du courant (I)
    - initial_temp: Température initiale du câble (Tc)
    
    Retourne:
    - Liste des températures à chaque minute (31 points: 0 à 30 min)
    """
    # Temps total en secondes (30 minutes)
    t_total = 30 * 60
    
    # Pas de temps en microsecondes
    dt = 1e-6  # 1 microseconde
    
    # Convertir en secondes pour le calcul
    dt_seconds = dt
    
    # Nombre d'itérations
    n_iterations = int(t_total / dt_seconds)
    
    # Stocker les températures pour chaque minute
    temperatures = [initial_temp]
    
    # Température courante
    T_current = initial_temp
    
    # Pour chaque minute, calculer la température
    for minute in range(1, 31):
        # Calculer jusqu'à la minute courante
        t_target = minute * 60  # Temps cible en secondes
        
        # Nombre d'itérations jusqu'à la minute courante
        n_iter_minute = int(t_target / dt_seconds) - int((minute - 1) * 60 / dt_seconds)
        
        # Intégration directe pour cette minute
        for _ in range(n_iter_minute):
            # Calculer la dérivée
            dTdt = cable_temperature_ode(T_current, None, ambient_temp, wind_speed, current)
            
            # Mettre à jour la température
            T_current += dTdt * dt_seconds
        
        # Ajouter la température à la fin de la minute
        temperatures.append(T_current)
    
    return temperatures

def calculate_temperature_scipy(ambient_temp, wind_speed, current, initial_temp=25.0):
    """
    Calcule la température du câble pour les 30 prochaines minutes en utilisant scipy.integrate.odeint
    
    Paramètres:
    - ambient_temp: Température ambiante (Ta)
    - wind_speed: Vitesse du vent (ws)
    - current: Intensité du courant (I)
    - initial_temp: Température initiale du câble (Tc)
    
    Retourne:
    - Liste des températures à chaque minute (31 points: 0 à 30 min)
    """
    # Définir les temps pour lesquels nous voulons la solution (0 à 30 minutes)
    t = np.linspace(0, 30 * 60, 31)  # 31 points pour 0 à 30 min, en secondes
    
    # Résoudre l'équation différentielle
    # Nous utilisons un pas d'intégration très fin pour correspondre à la microseconde
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
    
    return temperatures