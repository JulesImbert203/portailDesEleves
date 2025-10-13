# importer les models grace a __init__.py de models
from app.services import db
from app.models import *

from datetime import date, timedelta
from itertools import groupby

# Erreur levee si l'une de ces fonctions echoue
class ErreurDeLienUtilisateurs(Exception):
    def __init__(self, message):
        super().__init__(message)

# CO

def get_utilisateur(utilisateur_id) -> Utilisateur:  
    """Renvoie un utilisateur depuis son id"""
    if utilisateur_id:
        return db.session.get(Utilisateur, utilisateur_id)
    else:
        return None

def supprimer_co(utilisateur1:Utilisateur, utilisateur2:Utilisateur):
    """
    Supprime le lien de colocation entre les deux utilisateurs. 
    Leve si les deux utilisateurs ne sont pas co
    """
    if utilisateur1.co == utilisateur2 and utilisateur2.co == utilisateur1: # les deux sont co
            utilisateur1.co = None
            utilisateur2.co = None
            db.session.commit()       
    else :
        raise ErreurDeLienUtilisateurs("Erreur : les deux utilisateurs ne sont pas co.") # sinon erreur
    

def creer_co(utilisateur1:Utilisateur, utilisateur2:Utilisateur):
    """
    Crée un lien de colocation entre deux utilisateurs en modifiant leurs attributs.
    Si l'un des deux utilisateurs avait deja un co, le lien precedent est detruit. 
    """
    if utilisateur1.co is None and utilisateur2.co is None: # les deux sont libres : on cree le lien
        utilisateur1.co = utilisateur2
        utilisateur2.co = utilisateur1
    else :
        if utilisateur1.co is not None: # 1 a un co : on le supprime
            supprimer_co(utilisateur1, utilisateur1.co)
        if utilisateur2.co is not None: # 2 a un co : on le supprime
            supprimer_co(utilisateur2, utilisateur2.co)
        # Les deux sont libres : on met a jour
        utilisateur1.co = utilisateur2
        utilisateur2.co = utilisateur1
    db.session.commit()       

# PARRAINAGE

def ajouter_fillots_a_la_famille(marrain:Utilisateur, liste_fillots:list[Utilisateur]) :
    """
    Ajoute une liste de fillots a la famille. 
    Si l'un des fillots possede deja un marrain, le lien est detruit. 
    """
    fillots_a_ajouter = []
    for fillot in liste_fillots:
        # si le fillot a un marrain qui n'est pas le marrain actuel
        if fillot.marrain is not None and fillot.marrain.id != marrain.id:
            fillot.marrain = None
            fillots_a_ajouter.append(fillot)
        # si le fillot n'a pas de marrain
        elif fillot.marrain is None:
            fillots_a_ajouter.append(fillot)
        # si le fillot a déjà le marrain actuel comme marrain, on ne fait rien

    # modification
    marrain.fillots.extend(fillots_a_ajouter)
    db.session.commit()



def supprimer_fillots(marrain:Utilisateur) :
    """
    Supprime les fillots d'un utilisateur. Ne renvoie pas d'erreur si l'utilisateur n'a pas de fillot. 
    Supprime donc en consequence le marrain des fillots concernes
    """
    if marrain.fillots:
        marrain.fillots = []
        db.session.commit()

def changer_marrain(marrain:Utilisateur, fillot:Utilisateur):
    """
    Change le marrain d'un fillot.
    Si le fillot avait déjà un marrain, le lien est détruit.
    """
    fillot.marrain = marrain
    db.session.commit()

# AUTRES

def prochains_anniv():
    def comp(d, beg, end):
        if beg.year == end.year:
            return beg <= date(2000, month=d.month, day=d.day) < end
        else:
            # TODO : à faire correctement
            return beg <= date(2001, month=d.month, day=d.day) < end

    begin = date(year=2000, month=date.today().month, day=date.today().day - 1)
    end = begin + timedelta(days=7)

    users = db.session.query(Utilisateur.id, Utilisateur.prenom, Utilisateur.nom, Utilisateur.cycle, Utilisateur.promotion, Utilisateur.date_de_naissance).all()
    ret = sorted([(user.date_de_naissance, user.prenom, user.nom, user.cycle, user.promotion, user.id) for user in users if comp(user.date_de_naissance, begin, end)])
    ret = [(k, list(map(lambda x: (x[1], x[2], x[3], x[4], x[5]), list(g)))) for k, g in groupby(ret, lambda x: x[0])]
    print (ret)
    return ret
    