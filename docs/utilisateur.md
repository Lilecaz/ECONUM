# Documentation Utilisateur

## Prédiction de température

Envoyez une requête POST à l’endpoint `/predict/` avec le corps suivant :

```json
{
  "ambient_temperature": 25.0,
  "wind_speed": 3.0,
  "current_intensity": 120.0,
  "initial_temp": 25.0,
  "method": "scipy"
}
```

## Benchmark de performance

L’endpoint `/benchmark/matrix/` permet de lancer un benchmark :

```
GET /benchmark/matrix/?size=5000
```

## Résultats

- Températures sur 30 minutes  
- Temps d’exécution  
- Estimation des émissions carbone
