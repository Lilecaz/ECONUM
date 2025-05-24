# Rapport

## Architecture de la solution

La solution ECONUM se compose de deux composants principaux :

- **Backend** : Développé avec FastAPI, il expose deux endpoints :
  - `/predict/` : effectue une prévision de température sur 30 minutes.
  - `/benchmark/matrix/` : permet de mesurer les performances algorithmiques.
- **Empreinte carbone** : Les calculs critiques sont mesurés via **CodeCarbon v2.3.1**.
- **Frontend** : Une page HTML simple accessible via `/`, affichant les résultats au format lisible.
- **Notebook de test** : Un Jupyter Notebook permet d'exécuter les requêtes aux endpoints et d'afficher les résultats.

---

## Performances algorithmiques

| Méthode utilisée | Temps (s) | Temp. max (°C) | Temp. finale (°C) | CO₂ émis (ng) | Énergie totale (nkWh) | Complexité estimée |
| ---------------- | --------- | -------------- | ----------------- | ------------- | --------------------- | ------------------ |
| SciPy `odeint`   | 2.3118    | 26.07          | 26.07             | 7.79          | 115.55                | **\***             |

### Détails énergie :

- **Durée de calcul** : 0.01 s (CodeCarbon)
- **CPU** : 94.3% de l'énergie — 108.94 nkWh
- **RAM** : 5.7% de l'énergie — 6.61 nkWh
- **GPU** : 0%
- **Taux d’émission** : 595.62 nkg/s
- **Puissance CPU** : 32.5 W
- **Puissance RAM** : 11.96 W
- **Matériel utilisé** :
  - CPU : Intel Core i5-10500 (12 cœurs)
  - GPU : NVIDIA RTX 2060 SUPER (non sollicité)
  - OS : Windows 10

---

## Analyse temporelle : 30 x 1min vs 1 x 30min

| Mode de prévision     | Énergie (Wh) | Temps (s) | Avantages                         | Inconvénients                     |
| --------------------- | ------------ | --------- | --------------------------------- | --------------------------------- |
| 30 x 1 min (itératif) | ~0.3         | ~30       | Flexibilité, adaptation dynamique | 30 appels, latence cumulée        |
| 1 x 30 min (global)   | ~0.01        | 2.31      | Moins énergivore, plus rapide     | Moins précis si données variables |

**Choix recommandé** : 1 x 30 min est optimal pour les prédictions continues.

---


## Empreinte du front (HTML statique)

| Composant    | Énergie (Wh) | Optimisation possible          |
| ------------ | ------------ | ------------------------------ |
| HTML + JS    | 0.01         | Lazy loading, cache navigateur |
| Requêtes API | 0.08         | Délais, throttling client      |

---

## Conclusion et recommandations

- **Backend** :
  - SciPy suffit amplement pour un prototype stable.
  - Intégrer un cache pour limiter la charge serveur.
  - Superviser les usages CPU lors de charges importantes.
  
- **Frontend** :
  - Alléger les scripts.
  - Utiliser des requêtes différées ou groupées.

- **Stratégie de prévision** :
  - Privilégier des appels longs (30 min) plutôt que multiples appels courts.
  - Suivre les données environnementales en entrée (vent, intensité) pour adapter dynamiquement si besoin.

Cette version du projet est sobre énergétiquement et fonctionne efficacement à petite et moyenne échelle.
