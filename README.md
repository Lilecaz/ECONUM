# ECONUM - Prévision de Température de Câble

## À propos

ECONUM est une application moderne de prévision de température de câble électrique. Elle permet de simuler et d'analyser l'évolution de la température d'un câble en fonction de différents paramètres comme la température ambiante, la vitesse du vent et l'intensité du courant.

## Fonctionnalités

- Interface utilisateur moderne et responsive
- Simulation précise de la température des câbles
- Visualisation des données par graphique interactif Plotly et tableau
- Jauge de température avec indicateurs visuels
- Affichage des métriques clés (temps d'exécution, température maximale, etc.)

## Architecture

L'application est divisée en deux parties principales :

- **Backend** : API FastAPI en Python avec modèles de calcul scientifique
- **Frontend** : Interface utilisateur Next.js avec Tailwind CSS et shadcn/ui

## Installation

### Prérequis

- Node.js 18+ et npm
- Python 3.9+
- pip (gestionnaire de paquets Python)

### Installation du Backend

1. Naviguez vers le dossier Backend :
   ```bash
   cd Backend
2. Installez les dependances depuis le fichier requirement.txt
    ```bash
    pip install -r requirements.txt
3. Lancez le serveur
    ```bash
    python main.py  

### Installation du Frontend

1. Naviguez vers le dossier Frontend :
   ```bash
   cd frontend
2. Installez les dependances avec le flag --legacy-peer-deps
    ```bash
    npm install --legacy-peer-deps
3. Lancez le frontend
    ```bash
    npm run dev
4. Accédez à l'url suivante:
    ```bash
    http://localhost:3000