from app.services import db
from app.services.services_global import get_global_var, set_global_var
from app.models import Utilisateur, Conso


def _encaisser(utilisateur:Utilisateur, prix:float, asso:str, nom_conso:str):
    if asso == 'octo' :
        max_negatif_octo = get_global_var("max_negatif_octo")
        if max_negatif_octo :
            nouveau_solde = utilisateur.solde_octo - prix
            if nouveau_solde >= max_negatif_octo :
                utilisateur.solde_octo = nouveau_solde
                db.session.commit()
                return (True, f"{utilisateur.nom_utilisateur} : {nom_conso}, -{prix}€ dans compte octo. Nouveau solde : {utilisateur.solde_octo}.", prix, asso)
            else :
                return (False, f"Transaction avec {utilisateur.nom_utilisateur} refusée : fonds insuffisants ({utilisateur.solde_octo}).", 0, asso)
        else :
            utilisateur.solde_octo -= prix
            db.session.commit()
            return (True, f"{utilisateur.nom_utilisateur} : {nom_conso}, -{prix}€ dans compte octo. Nouveau solde : {utilisateur.solde_octo}." , prix, asso)
    else :
        max_negatif_biero = get_global_var("max_negatif_biero")
        if max_negatif_biero :
            nouveau_solde = utilisateur.solde_biero - prix
            if nouveau_solde >= max_negatif_biero :
                utilisateur.solde_biero = nouveau_solde
                db.session.commit()
                return (True, f"{utilisateur.nom_utilisateur} : {nom_conso}, -{prix}€ dans compte biero. Nouveau solde : {utilisateur.solde_biero}." , prix, asso)
            else :
                return (False, f"Transaction avec {utilisateur.nom_utilisateur} refusée : fonds insuffisants ({utilisateur.solde_biero}).", 0, asso)
        else :
            utilisateur.solde_biero -= prix
            db.session.commit()
            return (True, f"{utilisateur.nom_utilisateur} : {nom_conso}, -{prix}€ dans compte biero. Nouveau solde : {utilisateur.solde_biero}." , prix, asso)

def encaisser_utilisateur(utilisateur:Utilisateur, conso:Conso) :
    """
    Encaisse un utilisateur a l'octo ou a la biero selon le prix de la conso, s'il est cotisant ou non, 
    si sa dette ne depasse pas la dette maximale autorisee par l'asso. 
    Renvoie (etat, message, prix_encaisse, asso)
    - etat : True si la transaction a eu lieu, ou False si le solde est insuffisant
    - message : un message de log
    - prix : le prix qui a ete debite si c'est True
    - asso : l'asso concernee
    """
    if conso.prix_cotisant != None :
        if conso.asso == 'octo' and utilisateur.est_cotisant_octo :
            return _encaisser(utilisateur, conso.prix_cotisant, 'octo',  conso.nom_conso)
        elif conso.asso == 'biero' and utilisateur.est_cotisant_biero :
            return _encaisser(utilisateur, conso.prix_cotisant, 'biero',  conso.nom_conso)
        else :
            return _encaisser(utilisateur, conso.prix, conso.asso, conso.nom_conso)
    else :
        return _encaisser(utilisateur, conso.prix, conso.asso,  conso.nom_conso)

def crediter_utilisateur(utilisateur:Utilisateur, somme_a_crediter:int=0, asso='octo'):
    """
    credite le compte octo ou biero d'un utilisateu. La somme peut etre positive (gain) ou negative (perte)
    Renvoie un message de log
    """
    if asso == 'octo' :
        utilisateur.solde_octo += somme_a_crediter
        return f"{utilisateur.nom_utilisateur} : ajout de {somme_a_crediter}€ sur compte octo. Nouveau solde : {utilisateur.solde_octo}."
    elif asso == 'biero' :
        utilisateur.solde_biero += somme_a_crediter
        return f"{utilisateur.nom_utilisateur} : ajout de {somme_a_crediter}€ sur compte biero. Nouveau solde : {utilisateur.solde_biero}."
    db.session.commit()

def fixer_negatif_maximum(asso:str, maximum:int) :
    """
    La dette maximale autorisee. Il sera impossible d'encaisser quelqu'un en dessous de cette dette
    pour une dette maximale de 10 euros, mettre maximum=10
    """
    if maximum < 0 :
        raise ValueError("La dette maximale doit etre positive ou nulle")
    if asso == 'octo' :
        set_global_var('max_negatif_octo', maximum)
    elif asso == 'biero' :
        set_global_var('max_negatif_biero', maximum)
    else :
        raise ValueError("asso doit etre 'octo' ou 'biero'")
    db.session.commit()

def ajouter_nouvelle_conso(nom_conso:str, asso:str, prix:float, prix_cotisant:float=None) :
    conso = Conso(nom_conso=nom_conso, asso=asso, prix=prix, prix_cotisant=prix_cotisant)
    db.session.add(conso)
    db.session.commit()

def supprimer_conso(conso:Conso):
    db.session.delete(conso)
    db.session.commit()

def modifier_prix_conso(conso:Conso, nouveau_prix:float, nouveau_prix_cotisant:float=None) :
    """
    Modifie le prix de la conso. Si prix cotisant n'existe pas ou est egal a nouveau prix, le met a None
    """
    if not nouveau_prix_cotisant or nouveau_prix_cotisant == nouveau_prix :
        conso.prix = nouveau_prix
        conso.prix_cotisant = None
    else :
        conso.prix = nouveau_prix
        conso.prix_cotisant = nouveau_prix_cotisant
    db.session.commit()

def liste_des_consos(asso:str='octo'):
    """
    Charge la liste des consos de la biero ou de l'octo
    """
    return Conso.query.filter_by(asso=asso).all()