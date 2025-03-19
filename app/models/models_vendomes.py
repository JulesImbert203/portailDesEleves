from app import db

import os

class Vendome(db.Model):
    __tablename__ = 'vendomes'
    #ID du vendome
    id = db.Column(db.Integer, primary_key=True)

    #Éléments ajoutés à la création du vendome — Modifiables par les membres du vendome
    nom = db.Column(db.String(1000), nullable=True)
    date_parution = db.Column(db.String(1000), nullable=True)
    cache_aux_1A=db.Column(db.Boolean, nullable=True)
    edition_speciale=db.Column(db.Boolean, nullable=True)
    particularite=db.Column(db.String(1000), nullable=True)
    vendome_liste = db.Column(db.Strinn(1000), nullable=True)
    
    def __init__(self, nom:str, date_parution:str, cache_aux_1A:bool, edition_speciale:bool, particularite:str=None, vendome_liste:str=None):
        """
        Crée un nouveau vendome
        """
        self.nom = nom
        self.date_parution = date_parution
        self.cache_aux_1A = cache_aux_1A

        self.edition_speciale = edition_speciale
        self.particularite = particularite
        self.vendome_liste = vendome_liste
        # Créer un dossier pour le vendome
        self.create_vendome_folder()

    def __update__(self,nom:str=None,cache_aux_1A:bool=None,edition_speciale:bool=None,particularite:str=None,vendome_liste:str=None):
        """
        Modifie les valeurs d'un vendome, puis met a jour la base de donnee.

        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class vendome

        /!\ Sauf exceptions la table vendome n'est pas vouee a etre modifiee a la main.
        Cette fonction sera utilisee au sein de fonctions bien precises.

        ----------------------
        - nom : str
            Il s'agit du nom du vendome
        - date_parution : str
            Il s'agit de la date de parution du vendome
        - cache_aux_1A : bool
            Permet de savoir si le vendome est cache aux 1A ou pas
        - edition_speciale : bool
            Permet de savoir si le vendome est une edition speciale ou pas
        - particularite : str
            Permet de savoir si c'est un vendome de liste ou pas ou autre édition speciale
        - vendome_liste : str
            Si c'est un vendôme de liste, il s'agit de savoir si c'est la liste A ou B
        ----------------------

        """
        if nom:
            self.nom = nom
        if cache_aux_1A:
            self.cache_aux_1A = cache_aux_1A
        if edition_speciale:
            self.edition_speciale = edition_speciale
        if particularite:
            self.particularite = particularite
        if vendome_liste:
            self.vendome_liste = vendome_liste
        
    
    def create_vendome_folder(self):
        """
        Crée un dossier pour le vendome
        """
        folder_name=f'app/uploads/vendomes/vendome_{self.date_parution}'

        if self.particularite:
            folder_name=+f'_{self.particularite}'

        if self.vendome_liste:
            folder_name=+f'_{self.vendome_liste}'

        os.makedirs(folder_name, exist_ok=True)
    
