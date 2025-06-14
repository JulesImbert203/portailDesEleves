from app import db
import os
import re
import shutil

from app.models.models_associations import Association

from app.models.models_utilisateurs import Utilisateur

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

   