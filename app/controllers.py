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
            print(f"fillot a supprimer : {fillot.nom_utilisateur}")
            if fillot :
                if fillot.marrain_id == marrain.id :
                    fillot.update(marrain_id=None, marrain_nom=None)
                else :
                    raise ErreurDeLienUtilisateurs(f"le fillot {marrain.fillots_dict[fillot_id]}, present dans la liste des fillots de {marrain.nom_utilisateur} n'a pas enregistre {marrain.nom_utilisateur} comme marrain.")
            else :
                raise ErreurDeLienUtilisateurs(f"le fillot d'id {fillot_id}, present dans la liste des fillots de {marrain.nom_utilisateur} n'existe pas.")
        marrain.update(fillots_dict=None)
    else :
        print("Aucune modification (pas de fillots)")
        
    