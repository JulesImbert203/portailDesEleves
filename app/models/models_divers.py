# fichier pour les petite stables diverses

from app import db


# table des consos pour soifguard
class Conso(db.Model):
    """
    nom_conso, asso ('biero' ou 'octo'), prix, prix_cotisant(none si le meme) 
    le prix est donne en postif (il sera soustrait au solde lors de l'encaissement)
    """
    __tablename__ = 'consos'
    id = db.Column(db.Integer, primary_key=True)
    nom_conso = db.Column(db.String(1000), nullable=False)
    asso = db.Column(db.String(10), nullable=False, default='octo')
    prix = db.Column(db.Numeric(10, 2), nullable=False)  # Arrondi à 2 décimales
    prix_cotisant = db.Column(db.Numeric(10, 2), nullable=True)  # Arrondi à 2 décimales
    # prix_cotisant peut etre None si c'est le meme prix
    def __init__(self, nom_conso:str, asso:str='octo', prix:float=1, prix_cotisant:float=None):
        self.nom_conso = nom_conso
        if asso == 'octo' or asso == 'biero' :
            self.asso = asso
        else :
            raise ValueError(f"Erreur du champ {asso}. Doit etre 'octo' ou 'biero'")
        self.prix = prix
        self.prix_cotisant = prix_cotisant
    
class PermissionSoifguard(db.Model):
    """
    Contient les utilisateurs qui ont les permissions pour soifguard, pour l'octo ou pour la biero
    """
    __tablename__ = 'permissions_soifguard'
    id = db.Column(db.Integer, primary_key=True)
    id_utilisateur = db.Column(db.Integer, nullable=False)
    asso = db.Column(db.String(10), nullable=False, default='octo')
    def __init__(self, id_utilisateur:int, asso:str='octo'):
        self.id_utilisateur = id_utilisateur
        if asso == 'octo' or asso == 'biero' :
            self.asso = asso
        else :
            raise ValueError(f"Erreur du champ {asso}. Doit etre 'octo' ou 'biero'")