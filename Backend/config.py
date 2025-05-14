# Fichier de configuration pour l'application de prédiction de température de câble

# Paramètres du serveur
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000

# Paramètres de calcul par défaut
DEFAULT_INTEGRATION_METHOD = "scipy"  # "direct" ou "scipy"
DEFAULT_INITIAL_TEMPERATURE = 25.0    # Température initiale du câble en °C

# Paramètres d'échantillonnage pour le calcul direct
DIRECT_INTEGRATION_TIMESTEP = 1e-6    # Pas de temps en secondes (1 microseconde)

# Paramètres de surveillance d'énergie
ENERGY_SAMPLING_INTERVAL = 0.1        # Intervalle d'échantillonnage en secondes
CO2_PER_KWH = 475.0                   # Grammes de CO2 par kWh (valeur moyenne en France)

# Paramètres de cache
ENABLE_CACHE = True                   # Activer/désactiver le cache des calculs
MAX_CACHE_SIZE = 100                  # Nombre maximum d'entrées dans le cache

# Paramètres de journalisation
LOG_LEVEL = "INFO"                    # Niveau de journalisation (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_FILE = "cable_temp_api.log"       # Fichier de journalisation

# Paramètres CORS (Cross-Origin Resource Sharing)
CORS_ORIGINS = ["*"]                  # Origines autorisées (en production, spécifiez les domaines exacts)

# Paramètres d'affichage des résultats
ROUND_DECIMALS = 4                    # Nombre de décimales pour l'arrondi des résultats