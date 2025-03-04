# Logique metier de l'application

from app import db
from app.models import Utilisateur


#### Lien entre les utilisateurs

# Erreur levee si l'une de ces fonctions echoue
class ErreurDeLienUtilisateurs(Exception):
    def __init__(self, message):
        super().__init__(message)

# CO

def supprimer_co(user1_id, user2_id):
    """
    Supprime le lien de colocation entre les deux utilisateurs. 
    Leve une erreur si un utilisateur n'existe pas, ou si l'un des deux utilisateurs a un autre co.
    """
    user1 = Utilisateur.query.get(user1_id)
    user2 = Utilisateur.query.get(user2_id)
    if user1 and user2 :
        if user1.co_id == user2_id and user2.co_id == user1_id : # les deux sont co
            user1.update(co_id=None)
            user2.update(co_id=None)
            db.session.commit()
        else :
            if not (user1.co_id == None and user2.co_id == None) : # si ils n'ont deja pas de co rien ne se passe
                raise ErreurDeLienUtilisateurs("Erreur : les deux utilisateurs ne sont pas co.") # sinon erreur
    else :
        raise ValueError("Erreur : l'un des utilisateurs n'existe pas.")


def creer_co(user1_id, user2_id):
    """
    Crée un lien de colocation entre deux utilisateurs en modifiant leurs attributs.
    Si l'un des deux utilisateurs avait deja un co, le lien precedent est detruit. 
    """
    user1 = Utilisateur.query.get(user1_id)
    user2 = Utilisateur.query.get(user2_id)
    if user1 and user2:
        if user1.co_id == None and user2.co_id == None : # les deux sont libres : on cree le lien
            user1.update(co_id=user2_id)
            user2.update(co_id=user1_id)
            db.session.commit()            
        else :
            co_user_1_id = user1.co_id
            co_user_2_id = user2.co_id
            if co_user_1_id != None : # si ils ne sont pas libres, on supprime leur ancien lien
                supprimer_co(user1_id, co_user_1_id)
            if co_user_2_id != None :
                supprimer_co(user2_id, co_user_2_id)
            user1.update(co_id=user2_id, co_nom=f"{user2.prenom} {user2.nom_de_famille}")
            user2.update(co_id=user1_id, co_nom=f"{user1.prenom} {user1.nom_de_famille}")
            db.session.commit()       
    else:
        raise ValueError("Erreur : l'un des utilisateurs n'existe pas.")

# PARRAINAGE

def ajouter_fillots_a_la_famille(marrain_id, liste_ids_fillots) :
    """
    Ajoute une liste de fillots a la famille. Si des fillots existent deja, une erreur est levee.
    Si l'un des fillots possede deja un marrain, une erreur est levee. 
    """
    marrain = Utilisateur.query.get(marrain_id)
    if marrain :
        if marrain.fillots_dict == None : # verification que le marrain est libre
            liste_fillots = []
            for fillot_id in liste_ids_fillots :
                fillot = Utilisateur.query.get(fillot_id)
                if fillot :
                    liste_fillots.append(fillot)
                else : 
                    raise ValueError("Erreur : l'utilisateur fillot n'existe pas")

            # verification que chaque fillot est libre 
            for fillot in liste_fillots :
                if fillot.marrain_id != None :
                    raise ErreurDeLienUtilisateurs("Erreur : l'un des fillots a deja un marrain.")

            # modification
            dict_fillots = dict()
            for fillot in liste_fillots :
                fillot.update(marrain_id=marrain_id)
                dict_fillots[fillot.id] = f"{fillot.prenom} {fillot.nom_de_famille}"
            marrain.update(dict_fillots=dict_fillots)
            db.session.commit()
        else :
            raise ErreurDeLienUtilisateurs("Erreur : l'utilisateur marrain a deja des fillots. utilisez la fonction de suppression.")
    else :
        raise ValueError("Erreur : l'utilisateur marrain n'existe pas")
    
def supprimer_fillots(marrainid) :
    """
    Supprime les fillots d'un utilisateur. Ne renvoie pas d'erreur si l'utilisateur n'a pas de fillot. 
    """
    marrain = Utilisateur.query.get(marrainid)
    if marrain :
        fillots_dict = marrain.dict_fillots
        if fillots_dict != None :
            for fillot_id, fillot_nom in fillots_dict.items():
                fillot = Utilisateur.query.get(fillot_id)
                if fillot :
                    fillot.update(marrain_id=None)
            marrain.update(dict_fillots=None)
            db.session.commit()
    else :
        raise ValueError("Erreur : l'utilisateur marrain n'existe pas")
