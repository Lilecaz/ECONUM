import time
import psutil
import threading
import logging
from typing import Dict, List, Any

class EnergyMonitor:
    """
    Classe pour surveiller la consommation d'énergie et les émissions de CO2 pendant l'exécution du code.
    
    Cette classe utilise psutil pour estimer la consommation d'énergie.
    Pour une mesure plus précise en production, il faudrait utiliser pyRAPL ou PowerAPI.
    """
    
    def __init__(self, sampling_interval=0.1, co2_per_kwh=475.0):
        """
        Initialise le moniteur d'énergie.
        
        Paramètres:
        - sampling_interval: Intervalle d'échantillonnage en secondes
        - co2_per_kwh: Grammes de CO2 émis par kWh (valeur moyenne en France)
        """
        self.sampling_interval = sampling_interval
        self.co2_per_kwh = co2_per_kwh
        self.monitoring = False
        self.thread = None
        self.history = []
        self.total_energy = 0.0
        self.start_time = 0.0
        self.end_time = 0.0
        
        # Configuration du logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger("EnergyMonitor")
        
    def _monitor_thread(self):
        """
        Thread qui surveille la consommation CPU et estime la consommation d'énergie.
        """
        process = psutil.Process()
        
        while self.monitoring:
            try:
                # Mesurer l'utilisation du CPU
                cpu_percent = process.cpu_percent(interval=self.sampling_interval)
                
                # Estimer la consommation d'énergie (une approximation)
                # En production, on utiliserait pyRAPL ou PowerAPI pour des mesures précises
                # Supposons qu'un CPU moyen consomme environ 65W à pleine charge
                cpu_power_watts = (cpu_percent / 100.0) * 65.0
                
                # Convertir en joules (énergie = puissance × temps)
                energy_joules = cpu_power_watts * self.sampling_interval
                
                # Calculer les émissions de CO2 (en grammes)
                # 1 joule = 2.78e-7 kWh
                kwh = energy_joules * 2.78e-7
                co2_grams = kwh * self.co2_per_kwh
                
                # Ajouter à l'historique
                current_time = time.time()
                self.history.append({
                    "timestamp": current_time,
                    "energy_consumption_joules": energy_joules,
                    "co2_emissions_grams": co2_grams
                })
                
                # Mettre à jour le total
                self.total_energy += energy_joules
                
            except Exception as e:
                self.logger.error(f"Erreur dans le thread de monitoring: {str(e)}")
            
    def start_monitoring(self):
        """
        Démarre la surveillance de la consommation d'énergie.
        """
        if not self.monitoring:
            self.monitoring = True
            self.start_time = time.time()
            self.total_energy = 0.0
            self.thread = threading.Thread(target=self._monitor_thread)
            self.thread.daemon = True
            self.thread.start()
            self.logger.info("Monitoring d'énergie démarré")
            
    def stop_monitoring(self) -> Dict[str, float]:
        """
        Arrête la surveillance et retourne les résultats.
        
        Retourne:
        - Dict contenant la consommation d'énergie en joules et les émissions de CO2 en grammes
        """
        if self.monitoring:
            self.monitoring = False
            if self.thread:
                self.thread.join(timeout=1.0)  # Attendre que le thread se termine
            self.end_time = time.time()
            
            # Calculer les émissions de CO2 totales
            kwh = self.total_energy * 2.78e-7
            co2_grams = kwh * self.co2_per_kwh
            
            self.logger.info(f"Monitoring arrêté. Énergie totale: {self.total_energy:.6f} joules, CO2: {co2_grams:.6f} g")
            
            return {
                "energy_consumption_joules": self.total_energy,
                "co2_emissions_grams": co2_grams,
                "duration_seconds": self.end_time - self.start_time
            }
        else:
            return {
                "energy_consumption_joules": 0.0,
                "co2_emissions_grams": 0.0,
                "duration_seconds": 0.0
            }
            
    def get_history(self) -> List[Dict[str, Any]]:
        """
        Retourne l'historique complet des mesures.
        """
        return self.history
    
    def get_summary(self) -> Dict[str, Any]:
        """
        Retourne un résumé des mesures.
        """
        if not self.history:
            return {
                "total_energy_joules": 0.0,
                "total_co2_grams": 0.0,
                "average_power_watts": 0.0,
                "duration_seconds": 0.0
            }
            
        total_energy = sum(item["energy_consumption_joules"] for item in self.history)
        total_co2 = sum(item["co2_emissions_grams"] for item in self.history)
        duration = self.end_time - self.start_time if self.end_time > 0 else 0.0
        avg_power = total_energy / duration if duration > 0 else 0.0
        
        return {
            "total_energy_joules": total_energy,
            "total_co2_grams": total_co2,
            "average_power_watts": avg_power,
            "duration_seconds": duration
        }

    def reset_history(self):
        """
        Réinitialise l'historique des mesures.
        """
        self.history = []
        self.logger.info("Historique des mesures réinitialisé")