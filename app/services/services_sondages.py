# importer les models grace a __init__.py de models
from app.services import db
from app.models import *
from app.services.services_global import get_global_var, set_global_var
from datetime import datetime

# Erreur levee si l'une de ces fonctions echoue
class ErreurSondage(Exception):
    def __init__(self, message):
        super().__init__(message)


def proposer_sondage(question:str, reponses:list, utilisateur:Utilisateur) :
    """
    Ajouter un sondage dans la bdd. La liste des reponses possibles est au format ["reponse1", "reponse2", "reponse3"], de taille entre 2 et 4
    """
    if len(reponses) == 4 :
        proposition =  Sondage(question=question, reponse1=reponses[0], reponse2=reponses[1], reponse3=[2], reponse4=reponses[3], propose_par_user_id=utilisateur.id, date_sondage=datetime.now().strftime("%Y%m%d%H%M"), status=False)
    elif len(reponses) == 3 :
        proposition =  Sondage(question=question, reponse1=reponses[0], reponse2=reponses[1], reponse3=[2], propose_par_user_id=utilisateur.id, date_sondage=datetime.now().strftime("%Y%m%d%H%M"), status=False)
    elif len(reponses) == 2 : 
        proposition =  Sondage(question=question, reponse1=reponses[0], reponse2=reponses[1], propose_par_user_id=utilisateur.id, date_sondage=datetime.now().strftime("%Y%m%d%H%M"), status=False)
    else :
        raise ValueError(f"reponses doit etre un tableau de taille 4, pas {reponses}")
    db.session.add(proposition)
    db.session.commit()


# METTRE decorateur sondage_du_jour_required sur le controller
def creer_vote_sondage_du_jour(utilisateur:Utilisateur, vote:int) :
    """
    Fait voter un utilisateur a un sondage
    Met a jour utilisateur.vote_sondaj_du_jour
    Met a jour le nombre de votes du sondage de la reponse du sondage en question dans la table "votes_sondage_du_jour"
    - vote doit etre 1, 2, 3 ou 4. Cette fonction ne verifie pas si le vote est possible (ex : reponse 4 alors qu'il n'y a que 3 reponses possibles)
    - il faudra aussi verifier s'il y a bien un sondage aujourd'hui
    """
    if get_global_var("id_sondage_du_jour") is not None :
        utilisateur.vote_sondaj_du_jour = vote
        utilisateur.nombre_participations_sondaj += 1
        nouveau_vote = VoteSondageDuJour(id_utilisateur=utilisateur.id, numero_vote=vote)
        db.session.add(nouveau_vote)
        db.session.commit()
    else :
        raise ErreurSondage("Pas de sondage aujourd'hui, le vote est impossible")


def valider_sondage(id_sondage:int) :
    """
    Valide un sondage. Cette fonction ne pourra etre utilisee que par le vp_sondaj
    """
    sondage = db.session.get(Sondage, id_sondage)
    if sondage :
        if sondage.status :
            print("Sondage deja valide.")
        else :
            sondage.status = True
    else :
        raise ValueError("id de sondage invalide")

# Passage d'un sondage a un autre 
# Les fonctions suivantes ne doivent etre utilisees qu'au sein d'une meme route
def _resultat_sondage_du_jour(votes_sondage_du_jour) :
    """
    - Prend en entree la table des votes du jour, obtenue avec VoteSondageDuJour.query.all()
    Renvoie le resultat du sondage du jour : 
    [0, 2, 3, 10] : toujours un tableau de longueur 4
    Ne verifie pas si le sondage du jour existe, et que le vote a bien eu lieu
    """
    # comptage des votes : 
    votes = [vote.numero_vote for vote in votes_sondage_du_jour]
    compteur_votes = [0,0,0,0]
    for vote in votes :
        compteur_votes[vote] += 1
    return compteur_votes

def _donner_votes_gagnants(compteur_votes) :
    """prend en entree le tableau des votes, renvoie les numeros gagnants. Ne pas appliquer s'il n'y a pas eu de sondage ce jour"""
    gagnants = []
    maxi = 0
    for i in [1,2,3,4] :
        if compteur_votes[i] > maxi :
            maxi = compteur_votes[i]
    for i in [1,2,3,4] :
        if compteur_votes[i] == maxi :
            gagnants.append(i)
    return gagnants

def _update_si_win(utilisateurs, gagnants) :
    """
    Met a jour la ligne de l'utilisateur s'il a gagne le sondage du jour
    - utilisateurs : tableau d'utilisateurs
    - gagnants : tableau des votes gagnants
    """
    for utilisateur in utilisateurs :
        if utilisateur.vote_sondaj_du_jour in gagnants :
            utilisateur.nombre_victoires_sondaj += 1

def _archiver_sondage(sondage_du_jour:Sondage, compteur_votes) :
    """
    Archive un sondage qui vient de s'achever. Renvoie l'element a ajouter dans la table
    - sondage_du_jour : le sondage d'aujourd'hui a archiver
    - compteur vote : obtenu avec _resultat_sondage_du_jour
    Ne pas appliquer sur du None
    """       
    nouveau_ancien_sondage = AncienSondage(propose_par_user_id=sondage_du_jour.propose_par_user_id,
                                        date_d_archivage=datetime.now().strftime("%Y%m%d%H%M"),
                                        question=sondage_du_jour.question,
                                        reponse1=sondage_du_jour.reponse1,
                                        reponse2=sondage_du_jour.reponse2,
                                        reponse3=sondage_du_jour.reponse3,
                                        reponse4=sondage_du_jour.reponse4,
                                        votes1=compteur_votes[1],
                                        votes2=compteur_votes[2],
                                        votes3=compteur_votes[3],
                                        votes4=compteur_votes[4])
    return nouveau_ancien_sondage
 

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
            compteur_votes = _resultat_sondage_du_jour(votes)
            gagnants = _donner_votes_gagnants(compteur_votes)
            utilisateurs = [db.session.get(Utilisateur, vote.id_utilisateur) for vote in votes]
            _update_si_win(utilisateurs, gagnants)
            nouveau_ancien_sondage = _archiver_sondage(sondage_du_jour, compteur_votes)
            db.session.add(nouveau_ancien_sondage)
        db.session.delete(sondage_du_jour)
    # on met un nouveau sondage du jour
    nouveau_sondage_du_jour = Sondage.query.filter(Sondage.status == True).order_by(Sondage.date_sondage).first()
    if nouveau_sondage_du_jour :
        set_global_var("id_sondage_du_jour", nouveau_sondage_du_jour.id)
    else :
        set_global_var("id_sondage_du_jour", None)
    db.session.commit()


def obtenir_sondage_du_jour_et_votes():
    """
    Renvoie la question du sondage du jour, une liste des questions et une liste du nombre de votes pour chaque reponse.
    La taille des tableaux de résultats est ajustee en fonction du nombre de reponses disponibles (2, 3 ou 4).
    Si il n'y a pas de sondage aujourd'hui, renvoie None
    """
    id_sondage_du_jour = get_global_var("id_sondage_du_jour")
    if id_sondage_du_jour:
        sondage_du_jour = db.session.get(Sondage, id_sondage_du_jour)
        question_du_jour = sondage_du_jour.question
        reponses_brut = [
            sondage_du_jour.reponse1,
            sondage_du_jour.reponse2,
            sondage_du_jour.reponse3,
            sondage_du_jour.reponse4
        ]
        reponses = []
        for reponse in reponses_brut :
            if reponse != None :
                reponses.append(reponse)

        votes = VoteSondageDuJour.query.all()
        compteur_votes = [0, 0, 0, 0]
        for vote in votes:
            if 1 <= vote.numero_vote <= 4:
                compteur_votes[vote.numero_vote] += 1
    
        votes_par_question = compteur_votes[1:len(reponses) + 1]
        return question_du_jour, reponses, votes_par_question
    else :
        return None
