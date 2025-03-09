# init_db.py
"""
Ce fichier n'est utilise qu'une fois, pour initialiser les bases de donnees
"""

from app import create_app, db
from app.models import AppConfig

# Creer une instance de l'application Flask
app = create_app()

# Créer les tables si elles n'existent pas encore
with app.app_context():
    db.create_all()
    AppConfig.init_defaults()

print("Les tables ont ete creees avec succes !")
