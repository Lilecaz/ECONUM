# Documentation Technique

## Stack technique

- **Backend**: FastAPI
- **Calculs scientifiques**: SciPy, NumPy
- **Empreinte carbone**: CodeCarbon
- **Frontend statique**: HTML dans `static/index.html`

## Détails d’implémentation

### Modèle de température

L'équation différentielle utilisée est :

```
60 * dTc/dt = (-ws²/1600 * 0.4 - 0.1) * (Tc - Ta - I^1.4/73785 * 130)
```

Résolue via `scipy.integrate.odeint`.

### Empreinte carbone

L'intégration de CodeCarbon permet de suivre la consommation énergétique des calculs.

### Benchmark

Création d'une matrice aléatoire et calcul :

- Produit matriciel : `np.dot(matrix, matrix.T)`
- Valeurs propres : `np.linalg.eigvals(...)`
