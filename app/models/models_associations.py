from app import db
import os
import re
import shutil

from models_utilisateurs import Utilisateur


class Commentaire():
    def __init__(self, auteur:int, contenu:str, date:str) :
        """
        Crée un nouveau commentaire
        """
        self.auteur = auteur
        self.contenu = contenu
        self.date = date
        self.likes = []
    def add_like(self, id_utilisateur:int) :
        """
        Ajoute un like au commentaire
        """
        self.likes.append(id_utilisateur)
        self.likes = list(set(self.likes))
    def remove_like(self, id_utilisateur:int) :
        """
        Retire un like du commentaire
        """
        self.likes.remove(id_utilisateur)


class Publication(db.Model):
    __tablename__ = 'publication'
    #ID de l'association
    id = db.Column(db.Integer, primary_key=True)

    #Identification de l'association publiant le post
    id_association = db.Column(db.Integer, nullable=True)
    nom_association = db.Column(db.String(1000), nullable=True)

    #Identification de l'auteur du post, ne doit pas etre modifie
    id_auteur = db.Column(db.Integer, nullable=True)
    auteur = db.Column(db.String(1000), nullable=True)

    #Surtout utile pour la DE, par défaut vaut False pour les autres associations
    is_publiee_par_utilisateur = db.Column(db.Boolean, nullable=True)

    contenu = db.Column(db.String(10000), nullable=True)

    date_publication = db.Column(db.String(100), nullable=True)

    likes = db.Column(db.JSON, nullable=True)

    is_commentable = db.Column(db.Boolean, nullable=True)
    commentaires = db.Column(db.JSON, nullable=True)

    a_cacher_to_cycles = db.Column(db.JSON, nullable=True)

    a_cacher_to_promos = db.Column(db.JSON, nullable=True)

    is_publication_interne = db.Column(db.Boolean, nullable=True)

    def __init__(self, id_association:int, id_auteur : int, contenu:str, date_publication:str,is_commentable:bool, a_cacher_to_cycles:list=[], a_cacher_to_promos:list=[], is_publication_interne:bool=False, is_publiee_par_utilisateur:bool=False) :
        """
        Crée une nouvelle publication
        """

        self.id_association = id_association

        self.nom_association = Association.query.get(id_association).nom

        self.id_auteur = id_auteur
        self.auteur = Utilisateur.query.get(id_auteur).nom_utilisateur

        self.contenu = contenu

        self.date_publication = date_publication

        self.likes = []

        self.is_commentable = is_commentable

        self.commentaires = []

        self.a_cacher_to_cycles = a_cacher_to_cycles

        self.a_cacher_to_promos = a_cacher_to_promos

        self.is_publication_interne = is_publication_interne

        if self.nom_association == "DE" :
            self.is_publiee_par_utilisateur = True
        
        else :
            self.is_publiee_par_utilisateur = is_publiee_par_utilisateur


    def __update__(self, contenu:str=None, is_commentable:bool=None, a_cacher_to_cycles:list=None, a_cacher_to_promos:list=None, is_publication_interne:bool=None) :

        """
        Modifie les valeurs d'une publication.
        Il ne s'agit pas ici de modifier les likes ou les commentaires, 
        mais les informations de la publication elle-meme.
        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class Publication

        N.B : Dans la suite, il sera fait mention d'association publiant un post. Pour des
        raisons de simplicité, l'association pourra être la DE
        ----------------------
        - id_association : int
            ID de l'association publiant le post
        
        - nom_association : str
            Nom de l'association publiant le post, enregistré pour plus de facilité

        - id_auteur : int
            ID de l'auteur du post

        - auteur : str
            Nom de l'auteur du post, enregistré pour plus de facilité et de traçabilité

        - is_publiee_par_utilisateur : bool
            Surtout utile pour la DE, par défaut vaut False pour les autres associations,
            L'idée est de savoir si le post est affiché comme publié par l'utilisateur ou
            par l'association
        
        - contenu : str
            Contenu du post, peut contenir des sauts de ligne et des informations 
            de mise en page HTML

        - date_publication : str
            Date de publication du post au format 'AAAAMMJJHHMM'
        
        - likes : list
            Liste des ID des utilisateurs ayant liké le post

        - is_commentable : bool
            Indique si le post est commentable

        - commentaires : list
            Liste des commentaires du post, chaque commentaire est objet de la classe Commentaire


        - a_cacher_to_cycles : list
            Liste des cycles pour lesquels le post doit être caché (permet de préciser plutôt pour pas spammer les autres)

        - a_cacher_to_promos : list
            Liste des promotions pour lesquelles le post doit être caché (ex: un post pour le Baptême ou la PR)

        - is_publication_interne : bool
            Indique si le post est réservé aux membres de l'association ou visible par tous
            Permettrait peut-être à terme de gérer les posts des listes BDE, BDA, BDS

        """
        if contenu != None :
            self.contenu = contenu

        if is_commentable != None :
            self.is_commentable = is_commentable

        if a_cacher_to_cycles != None :
            self.a_cacher_to_cycles = a_cacher_to_cycles

        if a_cacher_to_promos != None :
            self.a_cacher_to_promos = a_cacher_to_promos

        if is_publication_interne != None :
            self.is_publication_interne = is_publication_interne

    def add_like(self, id_utilisateur:int) :
        """
        Ajoute un like à la publication
        """
        self.likes.append(id_utilisateur)
        self.likes = list(set(self.likes))

    def remove_like(self, id_utilisateur:int) :
        """
        Retire un like de la publication
        """
        self.likes.remove(id_utilisateur)

    def add_comment(self, auteur:int, contenu:str, date:str):
        """
        Ajoute un commentaire à la publication
        """
        if self.is_commentable == True :
            new_comment = {
                "auteur": auteur,
                "contenu": contenu,
                "date": date,
                "likes": []
            }
            self.commentaires.append(new_comment)

    def remove_comment(self, id_commentaire:int):
        """
        Retire un commentaire de la publication
        """
        del self.commentaires[id_commentaire]

    def add_like_to_comment(self, id_commentaire:int, id_utilisateur:int):
        """
        Ajoute un like à un commentaire
        """
        likes = self.commentaires[id_commentaire]['likes']
        likes.append(id_utilisateur)
        likes = list(set(likes))
        self.commentaires[id_commentaire]['likes'] = likes

    def remove_like_from_comment(self, id_commentaire:int, id_utilisateur:int):
        """
        Retire un like d'un commentaire
        """
        likes = self.commentaires[id_commentaire]['likes']
        likes.remove(id_utilisateur)
        self.commentaires[id_commentaire]['likes'] = likes
        

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


# LA LOGIQUE DES ÉVÉNEMENTS

class Evenement (db.Model):
    __tablename__ = 'evenements'
    #ID de l'évènement
    id = db.Column(db.Integer, primary_key=True)
    #ID de l'association organisatrice
    id_association = db.Column(db.Integer, nullable=True)
    nom_association = db.Column(db.String(1000), nullable=True)

    #Éléments ajoutés à la création de l'évènement — Modifiables par les membres de l'association
    nom = db.Column(db.String(1000), nullable=True)
    description = db.Column(db.String(1000), nullable=True)

    date_de_debut = db.Column(db.String(100), nullable=True)
    date_de_fin = db.Column(db.String(100), nullable=True)

    heure = db.Column(db.String(100), nullable=True)
    lieu = db.Column(db.String(1000), nullable=True)

    evenement_masque = db.Column(db.Boolean, nullable=True)

    evenement_periodique = db.Column(db.Boolean, nullable=True)

    jours_de_la_semaine = db.Column(db.JSON, nullable=True)

    heure= db.Column(db.String(100), nullable=True)
    


    def __init__(self, id_association:int, nom:str, description:str, lieu : str, evenement_periodique:bool, date_de_debut: str=None, date_de_fin : str = None, jours_de_la_semaine : list=None, heure : str = None) :
        
        """"
        Crée un nouvel évènement
        """
        self.id_association = id_association
        self.nom_association = Association.query.get(id_association).nom
        self.nom_dossier = re.sub(r'\W+', '', self.nom_association).lower()
        self.nom = nom
        self.description = description
        self.date_de_debut = date_de_debut
        self.date_de_fin = date_de_fin
        self.lieu = lieu

        self.evenement_masque = True
        
        self.evenement_periodique = evenement_periodique
        self.jours_de_la_semaine = jours_de_la_semaine
        self.heure = heure

        #self.create_evenement_folder()

    def __update__(self, 
                   nom:str=None,
                   description:str=None,
                   lieu:str=None,
                   evenement_masque:bool=None,

                   evenement_periodique:bool=None,

                   date_de_debut:str=None,
                   date_de_fin:str=None,
                    
                   jours_de_la_semaine : list=None,
                   heure : str = None
                   ) : 

        """            
        Modifie les valeurs d'un évènement, puis met a jour la base de donnee.

        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class évènement

        /!\ Sauf exceptions la table évènement n'est pas vouee a etre modifiee a la main.
        Cette fonction sera utilisee au sein de fonctions bien precises.

        ----------------------
        - nom : str
            Nom de l'évènement, peut contenir des accents et des caracteres speciaux.
        - description : str
            Description de l'évènement, peut contenir des accents et des caracteres speciaux 
            ainsi que des sauts de ligne et des informations de mise en page HTML.
        - date_de_debut : str
            Date de début de l'évènement au format AAAAMMJJHHMM
            Il s'agit de la date de début de l'évènement s'il n'est pas périodique, None s'il est périodique
        - date_de_fin : str
            Date de fin de l'évènement au format AAAAMMJJHHMM s'il n'est pas périodique, None s'il est périodique
        - lieu : str
            Lieu de l'évènement, peut contenir des accents et des caracteres speciaux.
        - evenement_masque : bool
            True si l'évènement est masqué, False sinon
        - evenement_periodique : bool
            True si l'évènement est périodique, False sinon
        - jours_de_la_semaine : list
            Liste des jours de la semaine où l'évènement a lieu, None s'il n'est pas périodique
        - heure : str
            Heure de l'évènement, au format HHMM
        """
        
        if nom != None :
            self.nom = nom

        if description != None :
            self.description = description

        if date_de_debut != None :
            self.date_de_debut = date_de_debut

        if date_de_fin != None :
            self.date_de_fin = date_de_fin

        if lieu != None :
            self.lieu = lieu

        if evenement_masque != None :
            self.evenement_masque = evenement_masque

        if evenement_periodique != None :
            self.evenement_periodique = evenement_periodique

        if jours_de_la_semaine != None :
            self.jours_de_la_semaine = jours_de_la_semaine
        
        if heure != None :
            self.heure = heure
    
    def create_evenement_folder(self) :
        """
        Crée un dossier pour l'évènement
        """
        #nettoyer le nom de l'association en ne gardant que les caractères alphanumériques en minuscule
        

        os.mkdir(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}_{self.heure.replace(':','')}")
    
    def remove_evenement_folder(self) :
        """
        Supprime le dossier de l'évènement
        """
        shutil.rmtree(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}_{self.heure.replace(':','')}")
    
    def change_visibility(self) :
        """
        Change la visibilité de l'évènement
        """
        self.evenement_masque = not self.evenement_masque
    
    def add_img(self, file,img_order : int) :
        """
        Ajoute une image à l'évènement
        """
        file_path = f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{img_order}_{file.filename}"

        file.save(file_path)

    def remove_img(self, img_order : int) :
        """"
        Supprime une image de l'évènement
        """
        for file in os.listdir(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}"):
            if file.startswith(f"{img_order}_"):
                file_path = f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{file}"
                os.remove(file_path)
                break
        
        #mettre à jour les ordres des images restantes
        for file in os.listdir(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}"):
            if int(file.split('_')[0]) > img_order:
                os.rename(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{file}",
                          f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{int(file.split('_')[0])-1}_{file.split('_')[1]}")
