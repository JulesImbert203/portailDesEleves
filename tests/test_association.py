# tests/test_app.py

from app import create_app, db
from app.models import Utilisateur,Association
from app.services.services_associations import *
from app.services.services_utilisateurs import *
from sqlalchemy.orm.attributes import flag_modified

def test_creer_utilisateur():
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Utiliser une DB en memoire pour les tests
    with app.app_context():
        db.create_all()  # Creer les tables

        try:
            # CREATION DE BASE DE TEST ICI -------------------------------------
            jules = Utilisateur(nom_utilisateur="23imbert", prenom="Jules", nom_de_famille="Imbert", promotion=23, email="jules@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
            achille = Utilisateur(nom_utilisateur="23fruchard", prenom="Achille", nom_de_famille="Fruchard", promotion=23, email="achille@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
            louise = Utilisateur(nom_utilisateur="24deferran", prenom="Louise", nom_de_famille="De Ferran", promotion=24, email="louise@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")

            bde = Association(nom="BDE", description="Bureau des élèves", type_association="loi 1901")
            bds = Association(nom="BDS", description="Bureau des sports", type_association="loi 1901")
            bda = Association(nom="BDA", description="Bureau des arts", type_association="loi 1901")
            bde.ordre_importance = 1
            bds.ordre_importance = 2
            bda.ordre_importance = 3    
            bde.id = 1
            bds.id = 2          
            bda.id = 3
            bde.logo_path = "app/upload/associations/bde/Capture_decran_2024-08-16_162358.png"
            bds.logo_path = "app/upload/associations/bds/logo_jump.png"
            bda.logo_path = "app/upload/associations/bda/channels4_profile (2).jpg"

            db.session.add(jules)
            db.session.add(achille)
            db.session.add(louise)

            db.session.add(bde)
            db.session.add(bds)
            db.session.add(bda)

            db.session.commit()

            # TESTS ICI
            #
            #
            #ajout de jules au bde
            """
            bde=Association.query.filter_by(nom="BDE").first()
            jules=Utilisateur.query.filter_by(nom_utilisateur="23imbert").first()
            
            add_member(bde,jules,'Président')
            #flag les changements
            flag_modified(bde, 'membres')
            db.session.commit()

            print('Ajout effectué')

            bde=Association.query.filter_by(nom="BDE").first()
            print(bde.membres)
            jules=Utilisateur.query.filter_by(nom_utilisateur="23imbert").first()
            update_member_role(bde,jules,'Trésorier')

            flag_modified(bde, 'membres')
            db.session.commit()
            print('Changement de rôle effectué')
            #
            #
            ###########
            bde=Association.query.filter_by(nom="BDE").first()
            jules=Utilisateur.query.filter_by(nom_utilisateur="23imbert").first()
            print(bde.membres)
            print(jules.assos_actuelles)
            
            remove_member(bde,jules)
            flag_modified(bde, 'membres')
            db.session.commit()
            bde=Association.query.filter_by(nom="BDE").first()
            print(bde.membres)"""



        except Exception as e:
            print(f"Une erreur est survenue : {e}")
            raise e

        finally:
            db.session.remove()
            db.drop_all()  # Nettoyer la BDD

if __name__ == "__main__":
    test_creer_utilisateur()
    print("Test passé avec succès!")
