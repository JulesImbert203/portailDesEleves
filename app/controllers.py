# Logique metier de l'application



# - - - -
# Regles generales : 
#
# * Pas de db.session.commit dans ces fonctions. Ces fonctions agissent sur les classes, 
# mais les changements ne sont enregistres par db.session.commit() qu'au sein des routes
# flaks (dans views/) pour des raisons de performance (par exemple, il vaut mieux mettre 
# a jour une fois apres avoir modifie trois utilisateurs que mettre a jour trois fois, 
# une fois par utilisateur).
#
# * Attention a ne jamais commit un changement ayant renvoye une erreur


from app import db
from app.models import Utilisateur,Sondage, GlobalVariable, VoteSondageDuJour, Association, Publication, Commentaire, Evenement, AncienSondage
from collections import Counter
from datetime import datetime

#### Lien entre les utilisateurs

# Erreur levee si l'une de ces fonctions echoue
class ErreurDeLienUtilisateurs(Exception):
    def __init__(self, message):
        super().__init__(message)

# CO

def supprimer_co(utilisateur1:Utilisateur, utilisateur2:Utilisateur):
    """
    Supprime le lien de colocation entre les deux utilisateurs. 
    Leve si les deux utilisateurs ne sont pas co
    """
    if utilisateur1.co_id == utilisateur2.id and utilisateur2.co_id == utilisateur1.id : # les deux sont co
            utilisateur1.update(co_id=None, co_nom=None)
            utilisateur2.update(co_id=None, co_nom=None)        
    else :
        raise ErreurDeLienUtilisateurs("Erreur : les deux utilisateurs ne sont pas co.") # sinon erreur
    # pas de db.session.commit()

def creer_co(utilisateur1:Utilisateur, utilisateur2:Utilisateur):
    """
    Crée un lien de colocation entre deux utilisateurs en modifiant leurs attributs.
    Si l'un des deux utilisateurs avait deja un co, le lien precedent est detruit. 
    """
    if utilisateur1.co_id == None and utilisateur2.co_id == None : # les deux sont libres : on cree le lien
        utilisateur1.update(co_id=utilisateur2.id, co_nom=f"{utilisateur2.prenom} {utilisateur2.nom_de_famille}")
        utilisateur2.update(co_id=utilisateur1.id, co_nom=f"{utilisateur1.prenom} {utilisateur1.nom_de_famille}")         
    else :
        if utilisateur1.co_id != None : # 1 a un co : on le supprime
            co_utilisateur1 = db.session.get(Utilisateur, utilisateur1.co_id)
            supprimer_co(utilisateur1, co_utilisateur1)
        if utilisateur2.co_id != None : # 2 a un co : on le supprime
            co_utilisateur2 = db.session.get(Utilisateur, utilisateur2.co_id)
            supprimer_co(utilisateur2, co_utilisateur2)
        # Les deux sont libres : on met a jour
        utilisateur1.update(co_id=utilisateur2.id, co_nom=f"{utilisateur2.prenom} {utilisateur2.nom_de_famille}")
        utilisateur2.update(co_id=utilisateur1.id, co_nom=f"{utilisateur1.prenom} {utilisateur1.nom_de_famille}")
    # pas de db.session.commit()       

# PARRAINAGE

def ajouter_fillots_a_la_famille(marrain:Utilisateur, liste_fillots:Utilisateur) :
    """
    Ajoute une liste de fillots a la famille. Si des fillots existent deja, une erreur est levee.
    Si l'un des fillots possede deja un marrain, une erreur est levee. 
    Ne devra etre utilisee qu'une fois, au moment d'ajouter ses fillots au parrainnage. 
    """
    if marrain.fillots_dict == None : # verification que le marrain est libre
        # verification que chaque fillot est libre 
        for fillot in liste_fillots :
            if fillot.marrain_id != None or fillot.marrain_nom != None :
                raise ErreurDeLienUtilisateurs(f"Erreur : {fillot.prenom} {fillot.nom_de_famille} a deja un marrain.")

        # modification
        fillots_dict = dict()
        marrain_id = marrain.id
        for fillot in liste_fillots :
            fillot.update(marrain_id=marrain_id, marrain_nom=f"{marrain.prenom} {marrain.nom_de_famille}")
            fillots_dict[fillot.id] = f"{fillot.prenom} {fillot.nom_de_famille}"
        marrain.update(fillots_dict=fillots_dict)
    else :
        raise ErreurDeLienUtilisateurs("Erreur : l'utilisateur marrain a deja des fillots. utilisez la fonction de suppression.")

def supprimer_fillots(marrain:Utilisateur) :
    """
    Supprime les fillots d'un utilisateur. Ne renvoie pas d'erreur si l'utilisateur n'a pas de fillot. 
    Supprime donc en consequence le marrain des fillots concernes
    Verifie avant de modifier le fillot que le lien etait bien comme il devait etre
    Cette fonction ne doit etre utilisee qu'en cas d'erreur lors de l'attribution des fillots
    """
    if marrain.fillots_dict != None :
        for fillot_id in marrain.fillots_dict:
            fillot = Utilisateur.query.get(fillot_id)
            if fillot :
                if fillot.marrain_id == marrain.id :
                    fillot.update(marrain_id=None, marrain_nom=None)
                else :
                    raise ErreurDeLienUtilisateurs(f"le fillot {marrain.fillots_dict[fillot_id]}, present dans la liste des fillots de {marrain.nom_utilisateur} n'a pas enregistre {marrain.nom_utilisateur} comme marrain.")
            else :
                raise ErreurDeLienUtilisateurs(f"le fillot d'id {fillot_id}, present dans la liste des fillots de {marrain.nom_utilisateur} n'existe pas.")
        marrain.update(fillots_dict=None)   


#### VARIABLES GLOBALES
# ICI TEMPORAIREMENT, A DEPLACER DANS AILLEURS
# l'appel a la BDD ne se fait pas dans controllers.py normalement


def get_global_var(key):
    var = GlobalVariable.query.filter_by(key=key).first()
    if var :
        return var.value
    else :
        raise KeyError(f"Pas de variable globale de nom {key}")


def set_global_var(key, value):
    var = GlobalVariable.query.filter_by(key=key).first()
    if var:
        var.value = value
    else:
        raise KeyError(f"Pas de variable globale de nom {key}")
        


#### VOTE A UN SONDAGE

# ATTENTION : Aucune des fonctions suivantes concernant les sondages n'ont ete testees

def creer_vote_sondage_du_jour(utilisateur:Utilisateur, vote:int) :
    """
    Fait voter un utilisateur a un sondage
    Met a jour utilisateur.vote_sondaj_du_jour
    Met a jour le nombre de votes du sondage de la reponse du sondage en question dans la table "votes_sondage_du_jour"
    - vote doit etre 1, 2, 3 ou 4. Cette fonction ne verifie pas si le vote est possible (ex : reponse 4 alors qu'il n'y a que 3 reponses possibles)
    - il faudra aussi verifier s'il y a bien un sondage aujourd'hui
    """
    utilisateur.vote_sondaj_du_jour = vote
    utilisateur.nombre_participations_sondaj += 1
    nouveau_vote = VoteSondageDuJour(id_utilisateur=utilisateur.id, numero_vote=vote)
    return nouveau_vote
    # utilisation au sein d'une route :  
    # nouveau_vote = creer_vote_sondage_du_jour(utilisateur, numero_vote)
    # db.session.add(nouveau_vote)
    # db.session.commit()

def valider_sondage(sondage:Sondage) :
    """
    Valide un sondage. Cette fonction ne pourra etre utilisee que par le vp_sondaj
    """
    if sondage.status :
        print("Sondage deja valide.")
    else :
        sondage.status = True

# Passage d'un sondage a un autre 
# Les fonctions suivantes ne doivent etre utilisees qu'au sein d'une meme route
def resultat_sondage_du_jour(votes_sondage_du_jour) :
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

def donner_votes_gagnants(compteur_votes) :
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

def update_si_win(utilisateurs, gagnants) :
    """
    Met a jour la ligne de l'utilisateur s'il a gagne le sondage du jour
    - utilisateurs : tableau d'utilisateurs
    - gagnants : tableau des votes gagnants
    """
    for utilisateur in utilisateurs :
        if utilisateur.vote_sondaj_du_jour in gagnants :
            utilisateur.nombre_victoires_sondaj += 1

def archiver_sondage(sondage_du_jour:Sondage, compteur_votes) :
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
 


#### GESTION DES ASSOCIATIONS

def add_member(association:Association, utilisateur:Utilisateur, role:str) :
        """
        Ajoute un membre à l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                association.membres.append({'id': utilisateur.id, 'nom_utilisateur':utilisateur.nom_utilisateur, 'role': role})
                #utilisateur.assos_actuelles[association.id] = role
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
    
def remove_member(association:Association,utilisateur:Utilisateur) :
        """
        Retire un membre de l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        Ne renvoie pas d'erreur si l'utilisateur n'est pas membre de l'association
        """
        association=Association.query.get(association.id)

        if association:
        
            utilisateur=Utilisateur.query.get(utilisateur.id)

            if utilisateur:
                for membre in association.membres:
                    if membre['id'] == utilisateur.id:
                        association.membres.remove(membre)
                        #utilisateur.assos_actuelles.pop(association.id)
                        break
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
        

def update_member_role(association:Association, utilisateur:Utilisateur, role:str) :
        """
        Modifie le role d'un membre de l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        Ne renvoie pas d'erreur si l'utilisateur n'est pas membre de l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                for membre in association.membres:
                    if membre['id'] == utilisateur.id:
                        membre['role'] = role
                        #utilisateur.assos_actuelles[association.id] = role
                        break
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
   

    
def update_members_order(association : Association, members_weights:list) :
        """
        Modifie l'ordre des membres de l'association en fonction de leur poids
        """
        association=Association.query.get(association.id)
        if association:
            membres=association.membres

            # création d'une liste de tuples contenant le poids, le nom et l'index du membre
            ordres=[[members_weights[i],membres[i]['nom_utilisateur'],i] for i in range(len(membres))]
            
            # tri des membres en fonction de leur poids puis de leur nom
            ordres.sort(key=lambda x: (-x[0],x[1]))

            # mise à jour de l'ordre des membres
            membres=[membres[ordre[2]] for ordre in ordres]

            association.membres=membres
        else:
            raise ValueError("L'association n'existe pas")


def add_publication(association:Association, utilisateur:Utilisateur, titre:str, contenu:str, date:str, heure:str) :
        """
        Ajoute une publication à l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                publication = Publication(titre=titre, contenu=contenu, auteur=utilisateur.id, date=date, heure=heure)
                association.publications.append(publication)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")


def remove_publication(association : Association, index_publication:int) :
        """
        Retire une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            del association.publications[index_publication]
        else:
            raise ValueError("L'association n'existe pas")

def add_like(association : Association, utilisateur:Utilisateur, index_publication:int) :
        """
        Ajoute un like à une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                association.publications[index_publication].add_like(utilisateur.id)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
    

def remove_like(association : Association, utilisateur:Utilisateur, index_publication:int) :
        """
        Retire un like d'une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                association.publications[index_publication].remove_like(utilisateur.id)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")  

def add_comment(association : Association, auteur:Utilisateur, index_publication:int, contenu:str, date:str) :
        """
        Ajoute un commentaire à une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            auteur=Utilisateur.query.get(auteur.id)
            if auteur:
                commentaire = Commentaire(contenu=contenu, auteur=auteur.id, date=date)
                association.publications[index_publication].add_comment(commentaire)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
    
def remove_comment(association : Association, index_publication:int, index_comment:int) :
        """
        Retire un commentaire d'une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            del association.publications[index_publication].commentaires[index_comment]
        else:
            raise ValueError("L'association n'existe pas")


### Gestion des évènements

def change_event_visibility(evenement: Evenement):
     
        """
        Change la visibilité d'un évènement
        """
        evenement=Evenement.query.get(evenement.id)
        if evenement:
            evenement.change_visibility()
        else:
            raise ValueError("L'évènement n'existe pas")
        

def supprimer_evenement(evenement: Evenement) :
        
        "Supprime un évènement"

        evenement=Evenement.query.get(evenement.id)

        if evenement:
             
                evenement.delete_folder()
                db.session.delete(evenement)
        
        else:
            raise ValueError("L'évènement n'existe pas")