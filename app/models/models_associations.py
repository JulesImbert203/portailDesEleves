from app import db
import os
import re
import shutil

from app.models.models_utilisateurs import Utilisateur



class Association(db.Model):
    __tablename__ = 'associations'
    #ID de l'association
    id = db.Column(db.Integer, primary_key=True)

    #Éléments ajoutés à la création de l'association — Modifiables par les membres de l'association
    nom = db.Column(db.String(1000), nullable=True)
    description = db.Column(db.String(1000), nullable=True)

    #Liste des membres de l'association
    membres = db.Column(db.JSON, nullable=True)
    
    type_association = db.Column(db.String(1000), nullable=True)
    ordre_importance = db.Column(db.Integer, nullable=True)

    def __init__(self, nom:str, description:str, type_association:str) :
        """
        Crée une nouvelle association
        """
        self.nom = nom
        self.description = description
        self.membres = []  # Initialiser comme une liste
        self.publications = []
        self.type_association = type_association

        # Créer un dossier pour l'association
        #self.create_association_folder()

    def __repr__(self):
        """
        Methode optionnelle, mais utile pour deboguer et afficher l'association.
        """
        return f"<Association {self.nom}>"

    
    def update(self, 
               nom:str=None,
               description:str=None) :
        """
        Modifie les valeurs d'une association, puis met a jour la base de donnee.

        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class association

        /!\ Sauf exceptions la table association n'est pas vouee a etre modifiee a la main.
        Cette fonction sera utilisee au sein de fonctions bien precises.

        ----------------------
        - nom : str
            Nom de l'association, peut contenir des accents et des caracteres speciaux.
        - description : str
            Description de l'association, peut contenir des accents et des caracteres speciaux 
            ainsi que des sauts de ligne et des informations de mise en page HTML.
        - membres : dict
            Liste des membres de l'association au format {id_utilisateur : role}.
            role est une chaine de caracteres, peut contenir des accents et des caracteres speciaux.
            exemple : { 1 : "Trez, VP fraude fiscale" }
        - publications : liste d'objets Publication
            Liste des publications de l'association
        
        - type_association : str
            Type de l'association, doit etre un des types suivants :
            {'loi 1901','club BDE','club BDS','club BDA','autre'}
        - ordre_importance : int
            Ordre d'importance de l'association, doit etre un entier positif (vaut par défaut l'id de l'association)
        """

        if nom != None :
            self.nom = nom
        if description != None :
            self.description = description

    def create_association_folder(self) :
        """
        Crée un dossier pour l'association
        """
        #nettoyer le nom de l'association en ne gardant que les caractères alphanumériques en minuscule
        nom_dossier = re.sub(r'\W+', '', self.nom).lower()

        os.mkdir(f"app/static/associations/{nom_dossier}")
    
    def get_members(self) :
        """
        Récupère les membres de l'association
        """
        members = []
        for member in self.membres:
            utilisateur = Utilisateur.query.get(member['id'])
            if utilisateur:
                members.append({
                    'id': utilisateur.id,
                    'nom_utilisateur': utilisateur.nom_utilisateur,
                    'prenom': utilisateur.prenom,
                    'nom_de_famille': utilisateur.nom_de_famille,
                    'role': member['role']
                })
        return members
