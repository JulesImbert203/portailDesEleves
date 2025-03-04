"""
Ce fichier de test ne sert qu'a developper. Il permet de tester les fonctions de controllers.py en lien avec la base de donnee.  
"""

# tests/test_app.py

from app import create_app, db
from app.models import Utilisateur
from app.controllers import creer_co, supprimer_co, ajouter_fillots_a_la_famille, supprimer_fillots

def test_creer_utilisateur():
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Utiliser une DB en memoire pour les tests
    with app.app_context():
        db.create_all()  # Creer les tables


        # CREATION DE BASE DE TEST ICI -------------------------------------
        #
        #

        jules = Utilisateur(nom_utilisateur="23imbert", prenom="Jules", nom_de_famille="Imbert", promotion=23, email="jules@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
        achille = Utilisateur(nom_utilisateur="23fruchard", prenom="Achille", nom_de_famille="Fruchard", promotion=23, email="achille@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
        louise = Utilisateur(nom_utilisateur="24deferran", prenom="Louise", nom_de_famille="De Ferran", promotion=24, email="louise@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")

        db.session.add(jules)
        db.session.add(achille)
        db.session.add(louise)

        db.session.commit()

        #
        #--------------------------------------------------------------------
        # TESTS ICI
        #
        def print_co_marrain(utilisateur):
            print(f"{utilisateur.prenom} {utilisateur.nom_de_famille}")
        

        #
        #
        # -------------------------------------------------------------------


        db.session.remove()
        db.drop_all()  # Nettoyer la base de données après le test

if __name__ == "__main__":
    test_creer_utilisateur()
    print("Test passé avec succès!")
