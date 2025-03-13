# __init__.py

"""
Ce fichier crée et initialise l'application et les extensions. Il charge la configuration
et enregistre les blueprints. 

Il est execute pour initialiser l'application. 

"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config

# Initialisation des extensions (sans encore les attacher à l'application)
db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    # Creation de l'instance de l'application Flask
    app = Flask(__name__)

    # Chargement de la configuration
    app.config.from_object(Config)
    
    # Initialisation des extensions avec l'application
    db.init_app(app)
    login_manager.init_app(app)

    from .models import Utilisateur  # Importer la classe Utilisateur

    # Definir la fonction user_loader
    @login_manager.user_loader
    def load_user(user_id):
        return Utilisateur.query.get(int(user_id))  # Charger l'utilisateur par ID
    
    # Importer les blueprints
    from .views.views_utilisateurs import utilisateurs_bp 
    from .views.views_admin import admin_bp 
    from .views.views_associations import associations_bp 
    from .views.views_index import index_bp 

    # Importer et enregistrer le blueprint global API
    from app.controllers import api
    app.register_blueprint(api, url_prefix='/api')
    
    # Enregistrer les blueprint
    app.register_blueprint(utilisateurs_bp) 
    app.register_blueprint(admin_bp) 
    app.register_blueprint(associations_bp) 
    app.register_blueprint(index_bp) 
    
    return app
