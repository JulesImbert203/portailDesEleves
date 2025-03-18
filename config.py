"""
Ce fichier contient la configuration de base de l'application, les paramètres de sécurité et 
les configurations de la base de données.

C'est ici qu'on précisera l'url de la base de donnée sur phpMyAdmin et les informations de 
connexion pour le deploiement. 

Pour le developpement, on commence par utiliser une bdd locale avec sqlite. Ce fichier est execute
par __init__.py lors de l'initialisation.
"""

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'une_cle_secrete_pour_developpement'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_SAMESITE='Lax'
    SESSION_COOKIE_SECURE=False
    #SESSION_COOKIE_SAMESITE = 'None'  # Nécessaire pour que le cookie soit envoyé dans des requêtes cross-origin
    #SESSION_COOKIE_SECURE = False  # Important si tu utilises HTTPS, sinon mets à False pour développement local
