# init_db.py
"""
Ce fichier n'est utilise qu'une fois, pour initialiser les bases de donnees
"""

from app import create_app, db
from app.models import GlobalVariable

# Creer une instance de l'application Flask
_, app = create_app()

# Créer les tables si elles n'existent pas encore
with app.app_context():
    db.create_all()
    # initilaisation des variables globales
    id_sond_jour = GlobalVariable(key="id_sondage_du_jour", value=None)
    max_negatif_octo = GlobalVariable(key="max_negatif_octo", value=None)
    max_negatif_biero = GlobalVariable(key="max_negatif_biero", value=None)
    
    db.session.add(id_sond_jour)
    db.session.add(max_negatif_octo)
    db.session.add(max_negatif_biero)
    
    db.session.commit()

print("Les tables ont ete creees avec succes !")
