# Documentation générale

Ce document décrit le fonctionnement général du projet, le rôle des différents fichiers, la logique interne. Une documentation plus précise est présente dans le code : chaque fonction est dûement commentée. 

Une documentation pour l'utilisation et la maintenance du portail sera écrite ultérieurement. 

## Comprendre l'organisation du projet

### Arborescence

Le nouveau portail est une application web, dont le backend est réalisé avec le framework Flask. Voilà les principaux fichiers et dossier qui le composent : 

```
my_project/
│
├── app/
│   ├── __pycache__         # Généré automatiquement par python, ne pas toucher
│   ├── __init__.py         # Initialisation de l'application Flask et des extensions
│   ├── models.py           # Définition des modèles de base de données (classes python)
│   ├── controllers.py      # Logique métier de l'application (voir plus bas)
│   │
│   ├── views/              # Routes de l'application Flask
│   │   ├── __pycache__                 # Généré automatiquement. Ne pas toucher
│   │   ├── views_main.py               # Routes principales
│   │   ├── views_utilisateurs.py       # Routes de gestion des utilisateurs
│   │   ├── views_index.py              # Routes de la page d'accueil
│   │   ├── views_admin.py              # Routes de gestion de l'admnistration du site
│   │   └── etc.
│   │   
│   ├── templates/          # Templates HTML
│   │   ├── index.html                  # Page principale
│   │   └── etc.
│   │
│   ├── static/             # Fichiers statiques : feuilles de style, javaScript, images, etc. 
│   │   ├── fichiers_divers             # TEDLT
│   │   ├── style                       # feuilles de style .css
│   │   ├── script                      # scripts .js
│   │   ├── images                      # TEDLT
│   │   └── etc.
│   │  
│   ├── utils/             # Fichiers contenant des fonctions diverses 
│   │   ├── decorators.py  # Contient les decorateurs personnalises, ("est_vp_sondaj", etc.)
│   │   └── verification_format.py      # fonctions de verification pour models.py
│   │  
│   └── services            # ?  
│
├── instance                # La base de données
├── config.py               # Configuration de l'application (contient les clefs secrètes)
├── run.py                  # Fichier pour lancer le serveur 
├── init_db.py              # Fichier pour initialiser la base de donnée du serveur à partir des modèles
└── requirements.txt        # Dépendances Python
```

### Détail des rôles des différents fichiers

Certains fichiers servent à démarrer le portail. D'autres fichiers codent son fonctionnement : le chargement des différents fichiers et l'interraction avec la base de donnée (BDD ci-après). D'autres gèrent l'organisation de la BDD et la manière avec laquelle on peut intéragir avec elle. Il est important de comprendre quel fichier fait quoi pour être capable de modifier efficacement le portail. Le rôle de chaque partie du projet va être détaillé, en commençant par le plus bas niveau : la structure de la base de données. 

#### 1 - La base de données

La BDD contient toutes les données nécessaire au fonctionnement du site. Elle est composées de différentes *tables*, que l'on peut voir comme des dataframes python. Il y a par exemple une table `Utilisateurs` qui contient la liste des utilisateurs, avec leurs informations. Une table de la base de données contient des *éléments*. Ainsi, tel utilisateur spécifique est un élément de la table `utilisateurs`. 

Ces éléments sont les éléments d'une classe python spéciale, qui décrit donc la forme de la table concernée (en utilisant la syntaxe de la bibliothèque de Flask `SQLAlchemy`, qui gère la base de données). Ces classes qui décrivent les tables de la BDD sont codées dans le fichier `models.py`. 

Lorsque le serveur est lancé pour la première fois, la base de données doit être créée selon le format imposé par les classes de `models.py`. Le fichier `init_db.py` gère cela : il n'est exécuté que lors du lancement du serveur, et crée la base de données. Elle est stockée dans le fichier `instance/app.db`. 

Mais le fichier `models.py` ne sert pas qu'à initialiser la base : seules les données sont stockées dans `instance/app.db`, leur format et les fonctions qui permettent d'interagir avec elles se trouvent dans les classes de `models.py`. Ainsi, lorsque le serveur est initialisé (avec `__init__.py`, voir plus loin), l'instance `db` est créée (à partir de `app`, voir plus bas), puis les classes de `models.py` sont importées. 

Attention, en important les classes de `models.py`, la base de donnée n'est pas *créée*, son contenu existe déjà, et est stocké dans `instance/`, dans le fichier `app.db`. L'appel à `models.py` ne sert qu'à lire le contenu de la base en interprétant chaque table comme un ensemble d'éléments des classes que contient `models.py`. 

Précisons également que `models.py`, une fois importé par `__init__.py`, importe lui même `db`, ce qui crée le lien entre les classes et la table (à laqulle on accède avec l'instance `db`). 

**En résumé** :
- La première fois, la base de données est créée en exécutant `init_db.py` selon les classes de `models.py`;
- quand la BDD existe, les données sont stockées dans `instance/app.db` ;
- l'instance `db` est utilisée pour interragir avec la BDD. Cette instance est initialisée par `__init__.py` ;
- ce même fichier charge également `models.py`, ce qui permet de lire les éléments de la base comme des éléments d'une classe python.

#### 2 - Démarrage du site

**La première fois**

Comme expliqué précédemment, pour créer la base de données, le portail doit-être initialisé pour la première fois avec `$ ipython ./init_db.py`. Cela crée les tables à partir des modèles de `models.py`. Cette initialisation n'a lieu qu'une fois. Attention, si la structure de la base est modifiée, pour éviter les erreurs il est nécessaire de la supprimer puis de la recréer en exécutant à nouveau ce fichier. 

**À chaque fois**

Ensuite, le portail est démarré avec `$ ipython ./run.py`
run.py fait appel à `__init__.py` qui crée l'application et démarre la base de donnée (`db = SQLAlchemy()`).  `config.py` contient la configuration utilisée lors de l'initialisation, elle contient le lien à la base (à terme, on utilisera une base sur phpMyAdmin par exemple et pas une base locale), les clefs secrètes, etc. 

#### 3 - Fonctionnement de l'application

- **`controllers.py`** : 

  Contient les fonctions de la logique métier de l'application. La logique métier (aussi appelée logique applicative) correspond aux règles spécifiques à l'application qui gèrent la manière dont les données sont manipulées et traitées. Ainsi, les fonctions de `controllers.py` seront utilisées pour modifier comme il se doit la base de donnée. ces fonctions seront appelées dans les routes Flask, dans les fichiers `views_xxx.py` de `views/`. 

  Ainsi, toute fonction qui agit sur les données (par exemple : gérer le lien marrain-fillot) pour régir les règles de l'application sera dans `controllers.py`.

- **`views/`** :

  Contient les fichiers pythons où sont codées les routes Flask. ces routes gèrent l'affichage des pages, font appel à des fonctions de `controllers.py`, et gèrent les requètes au serveur. C'est ça qui implémente le gros de l'interraction avec le site. 

- **`templates/`** :

  Dossier contenant les fichiers HTML pour le rendu des pages. Ces templates sont utilisés par les fonctions de route dans les fichiers `views/`, permettant d’afficher les données traitées par les contrôleurs sous forme de pages web.

#### 4 - Fichier des dépendances

**`requirements.txt`** :
  - Fichier listant toutes les dépendances Python nécessaires au fonctionnement de l’application.
  - Facilite l’installation des dépendances avec `pip install -r requirements.txt`.


En résumé, cette structure modulaire sépare les responsabilités :
- Les **routes** dans `views/` reçoivent les requêtes.
- Les **contrôleurs** dans `controllers.py` appliquent la logique et interagissent avec les modèles.
- Les **modèles** dans `models.py` gèrent les données de la base.
- Les **templates** dans `templates/` affichent les résultats.