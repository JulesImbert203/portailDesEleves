# tests/test_app.py

from app import create_app, db
from app.models import Utilisateur, Sondage, AncienSondage, VoteSondageDuJour, GlobalVariable
from app.controllers import *

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

            db.session.add(jules)
            db.session.add(achille)
            db.session.add(louise)

            db.session.commit()

            # initilaisation des variables globales
            var = GlobalVariable(key="id_sondage_du_jour", value=None)
            db.session.add(var)
            db.session.commit()

            # TESTS ICI
            #
            #
            from datetime import datetime
            import re

            def proposer_sondage(question, id_user) :
                """Ajouter un sondage dans la bdd"""
                proposition =  Sondage(question=question, reponse1="reponse1", reponse2="reponse2", reponse3="reponse3", reponse4="reponse4", propose_par_user_id=id_user, date_sondage=datetime.now().strftime("%Y%m%d%H%M"), status=False)
                db.session.add(proposition)
                db.session.commit()
                return proposition
            
            def lire_sondage_du_jour() :
                id_sondage_du_jour = get_global_var("id_sondage_du_jour")
                if id_sondage_du_jour :
                    sondage_du_jour = db.session.get(Sondage, id_sondage_du_jour)
                    print(f"question : {sondage_du_jour.question}\n - {sondage_du_jour.reponse1}\n - {sondage_du_jour.reponse2}\n - {sondage_du_jour.reponse3}\n - {sondage_du_jour.reponse4}\n")
                else :
                    print("pas de sondage du jour")
            
            # garder pour la route
            def sondage_suivant() :
                """
                - regarde l'id du sondage du jour
                - si il y en a un regarde si il y a des votes
                - si il y en a, compte les votes, trouve les votes gagnants, trouve les votants et leur ajoute une victoire
                - archive le sondage du jour 
                - supprime le sondage du jour de la table des sondages en attente
                - trouve le nouveau sondage du jour, met son id dans la variable globale
                """
                id_sondage_du_jour = get_global_var("id_sondage_du_jour")
                if id_sondage_du_jour :
                    # il y a un sondage du jour
                    sondage_du_jour = db.session.get(Sondage, id_sondage_du_jour)
                    votes = VoteSondageDuJour.query.all()
                    if votes != [] :
                        # des gens ont vote
                        compteur_votes = resultat_sondage_du_jour(votes)
                        gagnants = donner_votes_gagnants(compteur_votes)
                        utilisateurs = [db.session.get(Utilisateur, vote.id_utilisateur) for vote in votes]
                        update_si_win(utilisateurs, gagnants)
                        nouveau_ancien_sondage = archiver_sondage(sondage_du_jour, compteur_votes)
                        db.session.add(nouveau_ancien_sondage)
                    db.session.delete(sondage_du_jour)
                # on met un nouveau sondage du jour
                nouveau_sondage_du_jour = Sondage.query.filter(Sondage.status == True).order_by(Sondage.date_sondage).first()
                if nouveau_sondage_du_jour :
                    set_global_var("id_sondage_du_jour", nouveau_sondage_du_jour.id)
                else :
                    set_global_var("id_sondage_du_jour", None)
                db.session.commit()

                
            lire_sondage_du_jour()

            proposition1 = proposer_sondage("question ?", 2)
            proposition2 = proposer_sondage("question 2 ???", 2)
            valider_sondage(proposition1)
            valider_sondage(proposition2)
            
            db.session.commit()

            sondage_suivant()
            
            lire_sondage_du_jour()

            sondage_suivant()

            lire_sondage_du_jour()


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
