# tests/test_app.py

from app import create_app, db
from app.models import Utilisateur,Association,Publication,Evenement
from app.controllers import add_member, remove_member,update_member_role, update_members_order,change_event_visibility,supprimer_evenement
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
            bde=Association.query.filter_by(nom="BDE").first()
            jules=Utilisateur.query.filter_by(nom_utilisateur="23imbert").first()
            
            add_member(bde,jules,'Président')
            #flag les changements
            flag_modified(bde, 'membres')
            db.session.commit()

            print('Ajout effectué')

            #id_association:int, nom:str, description:str, lieu : str, evenement_periodique:bool, date_de_debut: str=None, date_de_fin : str = None, jours_de_la_semaine : list=None, heure : str = None
            interne=Evenement(id_association=1,nom='Interne de Noël',description='Ta plus grosse cuite de l\'année',lieu='Meuh',evenement_periodique=False,date_de_debut='202412202200',date_de_fin='202412210600')

            vendome=Evenement(id_association=1,nom='Vendôme',description='Piche',lieu='Meuh',evenement_periodique=True,date_de_debut=None,date_de_fin=None,jours_de_la_semaine=[1],heure='2100')
            
            jours={1:'Lundi',2:'Mardi',3:'Mercredi',4:'Jeudi',5:'Vendredi',6:'Samedi',7:'Dimanche'}

            db.session.add(interne)
            db.session.add(vendome)

            db.session.commit()
            print('Evenement ajouté')
            
            interne=Evenement.query.filter_by(nom='Interne de Noël').first()
            vendome=Evenement.query.filter_by(nom='Vendôme').first()

            change_event_visibility(interne)
            change_event_visibility(vendome)

            db.session.commit()
            print('Visibilité changée')
            
            interne=Evenement.query.filter_by(nom='Interne de Noël').first()
            
            interne.__update__(nom='Biéro',description='Ta plus grosse cuite de la semaine',lieu='Meuh',evenement_periodique=True,date_de_debut=None,date_de_fin=None,jours_de_la_semaine=[2],heure='2200')

            db.session.commit()
            print('Evenement modifié')

            biero=Evenement.query.filter_by(nom='Biéro').first()
            print(biero)
            print(biero.jours_de_la_semaine)
            

            

        except Exception as e:
            print(f"Une erreur est survenue : {e}")
            raise e

        finally:
            db.session.remove()
            db.drop_all()  # Nettoyer la BDD

if __name__ == "__main__":
    test_creer_utilisateur()
    print("Test passé avec succès!")
