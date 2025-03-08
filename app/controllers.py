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