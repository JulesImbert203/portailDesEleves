# tests/test_app.py

from app import create_app, db
from app.models import Utilisateur
from app.controllers import creer_co, supprimer_co, ajouter_fillots_a_la_famille, supprimer_fillots

def test_creer_utilisateur():
    _, app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Utiliser une DB en memoire pour les tests
    with app.app_context():
        db.create_all()  # Creer les tables

        try:
            # CREATION DE BASE DE TEST ICI -------------------------------------
            jules = Utilisateur(nom_utilisateur="23imbert", prenom="Jules", nom="Imbert", promotion=23, email="jules@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
            achille = Utilisateur(nom_utilisateur="23fruchard", prenom="Achille", nom="Fruchard", promotion=23, email="achille@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
            louise = Utilisateur(nom_utilisateur="24deferran", prenom="Louise", nom="De Ferran", promotion=24, email="louise@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")

            db.session.add(jules)
            db.session.add(achille)
            db.session.add(louise)

            db.session.commit()

            # TESTS ICI
            #
            #

            # marrain 
            def print_marrain_fillot(utilisateur):
                marrain_nom = "pas de marrain"
                if utilisateur.marrain_nom :
                    marrain_nom = f"({utilisateur.marrain_id}){utilisateur.marrain_nom}"
                fillots = "pas de fillots"
                if utilisateur.fillots_dict :
                    fillots = ", ".join([f"({id_f}) " + utilisateur.fillots_dict[id_f] for id_f in utilisateur.fillots_dict])
                print(f"({utilisateur.id}) {utilisateur.prenom} {utilisateur.nom} - marrain : {marrain_nom}, fillot(s) : {fillots}")
                

            print_marrain_fillot(louise)
            print_marrain_fillot(jules)
            print_marrain_fillot(achille)
            print("ajout...")
            ajouter_fillots_a_la_famille(jules, [louise, achille])

            db.session.commit()

            print_marrain_fillot(louise)
            print_marrain_fillot(jules)
            print_marrain_fillot(achille)

            print("suppression...")
            supprimer_fillots(jules)
            db.session.commit()

            print_marrain_fillot(louise)
            print_marrain_fillot(jules)
            print_marrain_fillot(achille)

            # co
            def print_co(utilisateur):
                co_nom = "pas de co"
                if utilisateur.co_id :
                    co_nom = f"({utilisateur.co_id}){utilisateur.co_nom}"
                print(f"({utilisateur.id}) {utilisateur.prenom} {utilisateur.nom} - co : {co_nom}")
                
            print_co(jules)
            print_co(louise)
            print_co(achille)

            creer_co(achille, jules)

            print_co(jules)
            print_co(louise)
            print_co(achille)

            creer_co(achille, louise)

            print_co(jules)
            print_co(louise)
            print_co(achille)
            
            #
            #
            ###########

        except Exception as e:
            print(f"Une erreur est survenue : {e}")
            raise e

        finally:
            db.session.remove()
            db.drop_all()  # Nettoyer la BDD

if __name__ == "__main__":
    test_creer_utilisateur()
    print("Test passé avec succès!")
