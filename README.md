# Documentation du nouveau portail des Élèves

## I. Structure

### A - Généralités sur les applications web

Le code d'une application web est séparé en deux parties distinctes. Le *frontend*, qui désigne la programmation des pages web à proprement parler, et le *backend*, le code qui régit la logique interne de l'application. Par exemple, si j'affiche la page d'un utilisateur, l'application lance une requête dans la base de données pour récupérer les données à afficher (c'est le backend qui fait ça), puis les données sont mises en forme au sein d'une page html (c'est le frontend qui fait ça).

En fait, programmer le backend d'une application c'est programmer une API avec un ensemble de requêtes qui permettent de faire fonctionner le site. Une requête pour obtenir les données d'un utilisateur, pour créer une association, pour voter à un sondage, etc.

Quant au frontend, il s'agit simplement de générer les pages web en fonction des données récupérées par des requêtes à l'API. Par exemple, afficher correctement les barres de répartition des votes sur les sondages.

### B - Organisation du projet Flask selon cette logique

#### 1) Les routes

Flask fonctionne avec des *routes*. Une route Flask est une fonction python précédée du décorateur :

`@nom_du_blueprint.route('/nom_de_la_route')`

Cette syntaxe indique à Flask comment l'on pourra exécuter la route : il faudra entrer l'URL :

`https://url_du_site/nom_du_blueprint/nom_de_la_route`

Une route peut être une fonction python quelconque, mais généralement il y aura deux types de routes :
- Les routes qui chargent du contenu web
- Les routes qui font des requêtes dans la base de données

Les routes qui chargent du contenu web (qui font donc partie du frontend) seront stockées dans le dossier `views/` du projet, et seront appelées *views*. Quant aux routes qui lancent des requêtes dans la base de données (BDD ci après) seront appelées *controllers* et seront rangées dans le dossier `controllers/`.

Précisons que ces routes, au sein de `views/` et de `controllers/` sont séparées en plusieurs fichiers python, appelées *blueprints* pour une meilleure organisation du code. Ce fichiers sont liés en un module python grace à leur fichier `__init__.py`. 

#### 2) La logique métier

La logique métier de l'application désigne son fonctionnement interne, l'ensemble des opérations et des liens à réaliser entre les différentes tables de la BDD. 

Nous avons dit que les controllers lançaient les requêtes dans la BDD : lorsque ces controllers sont appelés, il font appel à une fonction de la logique métier (rangées dans `services/`). En effet, pour que le code soit lisible et facile à maintenir, il est important de séparer les controllers des services. Un controller ne fera qu'exécuter une fonction, et renvoyer un résultat (souvent au format JSON), avec un code (200 pour une requête réussie, 400 pour une erreur client, 500 pour une erreur serveur, etc). La fonction exécutée qui gère les liens complexes au sein de la BDD appartient à `services/`. 

**Exemple :** Ajout d'un utilisateur dans une association.

Un bouton sur une page web mène à l'url de la route d'ajout d'un utilisateur. Cette route, dans `controllers/`, vérifie les permissions (voir plus loin), puis exécute la fonction `ajouter_membre(id_asso, id_membre, role)` de `services/`. Cette fonction ajoute l'association en question au tag `assos_actuelles` de l'utilisateur dans la table des utilisateurs, et ajoute l'utilisateur au tag `membres` de l'association dans la table des associations. Enfin, la fonction commit les changements dans la BDD. N'ayant pas déclenché d'erreur, la route renvoie un message de succès avec le code 200. Recevant ce message, la page web affiche un message de succès en HTML. 

#### 3) Les permissions 

Les services ne vérifient aucune permission. Cette vérification se fait au stade des routes, au moyen de décorateurs. La plupart des routes seront précédées du décorateur `@login_required`. Un utilisateur non connecté qui essaie d'exécuter cette route recevra une erreur 405. Ce décorateur est à placer avant chaque route qui en a besoin. D'autres décorateurs, plus spécifiques existent : `@vp_sondaj_required`, `@superutilisateur_required`, etc. Ces décorateurs sont implémentés dans `utils/decorators.py`. Ainsi, la vérification des permissions est implémentée une fois de manière générale, et peut être utilisée facilement partout dans le projet. 

### C - La base de données

La BDD contient toutes les données nécessaire au fonctionnement du site. Elle est composées de différentes *tables*, que l'on peut voir comme des dataframes python. Il y a par exemple une table `utilisateurs` qui contient la liste des utilisateurs, avec leurs informations. Une table de la base de données contient des *éléments*. Ainsi, tel utilisateur spécifique est un élément de la table `utilisateurs`. 

Ces éléments sont les éléments d'une classe python spéciale, qui décrit donc la forme de la table concernée (en utilisant la syntaxe de la bibliothèque de Flask `SQLAlchemy`, qui gère la base de données). Ces classes qui décrivent les tables de la BDD sont rangées dans le dossier `models/`. 

Lorsque le serveur est lancé pour la première fois, la base de données doit être créée selon le format imposé par les classes de `models/`. Le fichier `init_db.py` gère cela : il n'est exécuté que lors du lancement du serveur, et crée la base de données. Précisons que pour développer, nous utilisons une base sqlite locale stockée dans le fichier `instance/app.db`. Pour le déploiement, nous utiliserons une meilleure base de données. 

`models/` ne sert pas qu'à initialiser la base : seules les données sont stockées dans `instance/app.db`, leur format et les fonctions qui permettent d'interagir avec elles se trouvent dans les classes de `models/`. Ainsi, lorsque le serveur est initialisé (avec `__init__.py`, voir plus loin), l'instance `db` est créée (à partir de `app`, voir plus bas), puis les classes de `models/` sont importées. 

Attention, en important les classes de `models/`, la base de donnée n'est pas *créée*, son contenu existe déjà, et est stocké dans `instance/`, dans le fichier `app.db`. L'appel à `models/` ne sert qu'à lire le contenu de la base en interprétant chaque table comme un ensemble d'éléments des classes que contient `models/`. 

Précisons également que `models/`, une fois importé par `__init__.py`, importe lui même `db`, ce qui crée le lien entre les classes et la table (à laquelle on accède avec l'instance `db`). 

**En résumé** :
- La première fois, la base de données est créée en exécutant `init_db.py` selon les classes de `models.py`;
- quand la BDD existe, les données sont stockées dans `instance/app.db` ;
- l'instance `db` est utilisée pour interagir avec la BDD. Cette instance est initialisée par `__init__.py` ;
- ce même fichier charge également `models.py`, ce qui permet de lire les éléments de la base comme des éléments d'une classe python.


### D - Arborescence du projet

À la lumière de ce qui précède, l'arborescence du projet est la suivante : 

```
nouveau_portail/
│
├── app/
│   ├── __pycache__             # Généré automatiquement par python, ne pas toucher
│   ├── __init__.py             # Initialisation de l'application Flask et des extensions
│   ├── models/                 # Tables de la BDD
│   ├── controllers/            # Requêtes à la BDD
│   ├── services/               # Logique métier
│   ├── views/                  # Chargement des pages web
│   ├── templates/              # Morceaux de pages web en html
│   ├── static/                 # Fichiers statiques : feuilles de style, javaScript, images, etc. 
│   │   ├── fichiers_divers     
│   │   ├── style               # feuilles de style .css
│   │   ├── script              # scripts .js
│   │   ├── images                      
│   │   └── etc.
│   │  
│   └── utils/                  # Utilitaires
│       ├── decorators.py       # Décorateurs pour les permissions ("@est_vp_sondaj", etc.)
│       └── etc.                # Autres fichiers de fonctions utilitaires
│
├── tests/                      # Fichers de test
├── instance /                  # La base de données locale pour le développement
├── config.py                   # Configuration de l'application
├── run.py                      # Fichier pour lancer le serveur 
├── init_db.py                  # Fichier pour initialiser la BDD à partir des modèles
└── requirements.txt            # Dépendances Python
```

Résumons le rôle de chaque élément :

- **`models/`** :
 Les classes python qui structurent les données de la base, qui permettent de l'initialiser puis de la lire et de la modifier. Ces classes seront manipulées par les fonction de `services/`.

- **`services/`** : 
    La logique métier de l'application, qui implémente les règles spécifiques à l'application qui gèrent la manière dont les données sont manipulées et traitées. Ces fonctions seront appelées par les controllers. 

- **`controllers/`** : 
  Contient les routes de requêtes à l'API, qui font appel aux fonction de `services/` pour lire et modifier des données selon la logique de l'application. Les permissions sont vérifiées avec des décorateurs de `decorators.py`.

- **`views/`** :
  Contient les routes pour gérer l'affichage des pages web et le lien entre elles, en fonction des résultats des requêtes envoyées avec les controllers.

- **`templates/`** :
  Dossier contenant les fichiers HTML pour le rendu des pages. Ces templates sont utilisés par les fonctions de route dans les fichiers `views/`, permettant d’afficher les données traitées par les controllers sous forme de pages web.

- **`static/`** :
    Contient les données statiques du site : les images, les icônes, les feuilles de style, le javascript, etc. 

- **`requirements.txt`** :
  Fichier listant toutes les dépendances Python nécessaires au fonctionnement de l’application. Facilite l’installation des dépendances avec `$ pip install -r requirements.txt`.


## II. Fonctionnement du site

### A - Démarrage

**La première fois**

Comme expliqué précédemment, pour créer la base de données, le portail doit-être initialisé pour la première fois avec `$ ipython ./init_db.py`. Cela crée les tables à partir des modèles de `models.py`. Cette initialisation n'a lieu qu'une fois. Attention, si la structure de la base est modifiée, pour éviter les erreurs il est nécessaire de la supprimer puis de la recréer en exécutant à nouveau ce fichier. 

**À chaque fois**

Ensuite, le portail est démarré avec `$ ipython ./run.py`
run.py fait appel à `__init__.py` qui crée l'application et démarre la base de donnée (`db = SQLAlchemy()`).  `config.py` contient la configuration utilisée lors de l'initialisation, elle contient le lien à la base (à terme, on utilisera une base sur phpMyAdmin par exemple et pas une base locale), les clefs secrètes, etc. 





