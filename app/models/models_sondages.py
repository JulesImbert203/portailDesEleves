from models_general import GlobalVariable
from app import db

# verification du format des donnees :
from ..utils.verification_format import *


# LA LOGIQUE DES SONDAGES
# 
# Il y a quatre elements de la BDD qui gerent les sondages :
# - la table 'sondages_en_attente' qui contient tous les sondages non publies : valides et en attente, leurs questions, leurs reponses, 
# - la table 'anciens_sondages' qui contient tous les sondages parrus, leurs reponses et le vote par reponse
# - la variable globale 'id_sondage_du_jour' qui contient l'id dans 'sondage_en_attente' du sondage actuellement publie
# - la table 'votes_sondage_du_jour' qui contient les id des utilisateurs votant et leur reponse au sondage du jour     

class Sondage(db.Model):
    """
    Cette classe sert a stocker les nouveaux sondages, non encore publies, 
    et le sondage du jour. 
    L'id du sondage du jour est stocke dans la table des variables globales 
    Les votes du jour sont stockes dans la table 'votes_sondage_du_jour'
    Un sondage ne peut parraitre que si son tag "est_valide" est a True
    La route pour appeler la fonction qui modifiera ca sera protegee par le decorateur @vp_sondaj_required
   """
    __tablename__ = 'sondages'
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    question = db.Column(db.String(1000), nullable=False)
    # reponses possibles
    reponse1 = db.Column(db.String(500), nullable=False)
    reponse2 = db.Column(db.String(500), nullable=False)
    reponse3 = db.Column(db.String(500), nullable=True) # on peut avoir 2 3 ou 4 reponses
    reponse4 = db.Column(db.String(500), nullable=True)
    # donnees du sondage
    propose_par_user_id = db.Column(db.Integer, nullable=False)
    date_sondage = db.Column(db.String(20), nullable=False) # au format AAAAMMJJHHMM
    status = db.Column(db.Boolean, nullable=False, default=False) # False : non autorise, True : en attente de publciation ou sondage du jour
    
    def __init__(self, propose_par_user_id:int, date_sondage:str, question:str, reponse1:str, reponse2:str, reponse3:str=None, reponse4:str=None, status:bool=False) :
        """
        Cree un nouveau sondage
        """
        self.propose_par_user_id = propose_par_user_id
        if valider_date_AAAAMMJJHHMM(date_sondage):
            self.date_sondage = date_sondage
        else :
            raise ValueError("Fomat invalide de date")
        self.question = question
        self.reponse1 = reponse1
        self.reponse2 = reponse2
        self.reponse3 = reponse3
        self.reponse4 = reponse4
        self.status = False

class AncienSondage(db.Model):
    """
    Table des anciens sondages : contient la date de publication, l'utilisateur 
    ayant propose, la question, les reponses, le nombre de votes par reponse
    """
    __tablename__ = 'anciens_sondages'
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    question = db.Column(db.String(1000), nullable=False)
    # reponses possibles
    reponse1 = db.Column(db.String(500), nullable=False)
    reponse2 = db.Column(db.String(500), nullable=False)
    reponse3 = db.Column(db.String(500), nullable=True) # on peut avoir 2 3 ou 4 reponses
    reponse4 = db.Column(db.String(500), nullable=True)
    # donnees du sondage
    propose_par_user_id = db.Column(db.Integer, nullable=False)
    date_d_archivage = db.Column(db.String(20), nullable=False) # au format AAAAMMJJHHMM
    # nombre de votes pour chaque reponse
    votes1 = db.Column(db.Integer, nullable=False, default=0)
    votes2 = db.Column(db.Integer, nullable=False, default=0)
    votes3 = db.Column(db.Integer, nullable=False, default=0)
    votes4 = db.Column(db.Integer, nullable=False, default=0)

    def __init__(self, propose_par_user_id:int, date_d_archivage:str, question:str, reponse1:str, reponse2:str, reponse3:str, reponse4:str, votes1:int, votes2:int, votes3:int, votes4:int) :
        """
        Cree un nouveau "ancien_sondage" (sera appele a partir des donnees du sondage du jour)
        """
        self.propose_par_user_id = propose_par_user_id
        if valider_date_AAAAMMJJHHMM(date_d_archivage):
            self.date_d_archivage = date_d_archivage
        else :
            raise ValueError("Fomat invalide de date")
        self.question = question
        self.reponse1 = reponse1
        self.reponse2 = reponse2
        self.reponse3 = reponse3
        self.reponse4 = reponse4
        self.votes1 = votes1
        self.votes2 = votes2
        self.votes3 = votes3
        self.votes4 = votes4

class VoteSondageDuJour(db.Model):
    """
    Contient les utilisateurs ayant vote au sondage du jour, et leur vote
    """
    __tablename__ = 'votes_sondage_du_jour'
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    id_utilisateur = db.Column(db.Integer, nullable=False)
    numero_vote = db.Column(db.Integer, nullable=False)
