# Arborescence du frontend

```
frontend/
│── src/
│   ├── components/  # Composants réutilisables
│   ├── pages/       # Pages principales (Accueil, Direction, SPA)
│   ├── App.jsx      # Routeur principal
│   ├── api.js       # Gestion des requêtes à Flask
│   ├── main.jsx     # Entrée principale de React
│── public/
│   ├── index.html   # Page HTML de base
│── package.json     # Dépendances et scripts

```

/src
│
├── /components
│   ├── LayoutContext.js      # Contexte pour gérer l'état du composant central
│   ├── Layout.js             # Structure de la page avec les blocs et la zone centrale
│   ├── blocs
│   │   └── BlocSondage.js    # Exemple de bloc (comme un sondage à gauche)
│
├── /pages
│   ├── Accueil.js            # Page d'accueil
│   ├── Direction.js          # Page de direction
│   └── AppPage.js            # Page principale avec la logique pour changer le composant central
│
├── /assets
│   └── styles
│       └── layout.css        # CSS pour la mise en page (structure)
│
├── main.jsx                  # Point d'entrée de l'application
└── App.jsx                    # Gère les routes principales
