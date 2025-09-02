# tests/test_app.py

from app import create_app, db
from app.models.models_associations import Association
from app.models.models_utilisateurs import Utilisateur
from app.models.models_publications import Publication
from app.services.services_publications import *
from app.services.services_associations import *
from app.services.services_utilisateurs import *
from sqlalchemy.orm.attributes import flag_modified

def test_creer_utilisateur():
    _, app = create_app()
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

            publication=Publication(id_association=bde.id, id_auteur=jules.id,contenu="Piche",date_publication='202503110028',is_commentable=True)
            db.session.add(publication)
            db.session.commit()

            print('Publication ajoutée')

            publication=Publication.query.filter_by(id_association=bde.id).first()
            add_comment(publication,jules,"Commentaire de Jules",'202503110028')
            flag_modified(publication, 'commentaires')
            db.session.commit()

            publication=Publication.query.filter_by(id_association=bde.id).first()
            

            add_like(publication,jules)

            flag_modified(publication, 'likes')
            db.session.commit()

            publication=Publication.query.filter_by(id_association=bde.id).first()


            add_like_to_comment(publication,achille,0)

            flag_modified(publication, 'commentaires')
            db.session.commit()
 

            print('Contenu :',publication.contenu)
            print('Likes :',publication.likes)
            print('Commentaire :',publication.commentaires)
            print('---------------------------------')

            publication=Publication.query.filter_by(id_association=bde.id).first()

            remove_like_from_comment(publication,achille,0)

            flag_modified(publication, 'commentaires')
            db.session.commit()

            print('Likes :',publication.commentaires[0])

            publication=Publication.query.filter_by(id_association=bde.id).first()

            remove_comment(publication,0)

            flag_modified(publication, 'commentaires')
            db.session.commit()

            publication=Publication.query.filter_by(id_association=bde.id).first()
            print('Commentaire :',publication.commentaires)
            print('---------------------------------')



        except Exception as e:
            print(f"Une erreur est survenue : {e}")
            raise e

        finally:
            db.session.remove()
            db.drop_all()  # Nettoyer la BDD

if __name__ == "__main__":
    test_creer_utilisateur()
    print("Test passé avec succès!")
