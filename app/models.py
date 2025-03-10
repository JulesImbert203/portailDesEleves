# Definition des modeles de base de donnees

from app import db
from sqlalchemy.ext.mutable import MutableDict
from flask_login import UserMixin # pour faire le lien entre la class utilisateur et flask_login
from werkzeug.security import generate_password_hash # Pour hacher les mdp 
import json
import os
import shutil

# verification du format des donnees :
from utils.verification_format import *

# TESTER 
class AppConfig(db.Model):
    """
    Configuration du site : contient les variables globales
    """
    id = db.Column(db.Integer, primary_key=True)
    id_sondage_du_jour = db.Column(db.Integer, nullable=True) # None = pas de sondage aujourd'hui
    @staticmethod
    def get():
        """Retourne la configuration actuelle (la premiere ligne)"""
        return db.session.query(AppConfig).first()
    @staticmethod
    def init_defaults():
        """Cree une config par défaut si elle n'existe pas"""
        if not db.session.query(AppConfig).first():
            config = AppConfig()
            db.session.add(config)
            db.session.commit()
    @staticmethod
    def set(key, value):
        """Modifie une variable globale et la sauvegarde"""
        config = AppConfig.get()
        if not config:
            config = AppConfig()
            db.session.add(config)


class Utilisateur(db.Model, UserMixin) :
    __tablename__ = 'utilisateurs'
    # Initialise lors de l'ajout d'une promotion. Ne dois pas etre modifiable par l'utilisateur
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    nom_utilisateur = db.Column(db.String(100), nullable=False, unique=True)
    prenom = db.Column(db.String(1000), nullable=False)
    nom_de_famille = db.Column(db.String(1000), nullable=False)
    promotion = db.Column(db.String(4), nullable=True)
    cycle = db.Column(db.String(10), nullable=False) # Parmi 'ic', 'ast', 'vs', 'ev', 'isup', 'de'
    est_nouveau_a_la_mine = db.Column(db.Boolean, nullable=False, default=True)
    est_visible = db.Column(db.Boolean, nullable=False, default=True)
    est_vp_sondaj = db.Column(db.Boolean, nullable=False, default=False)
    est_superutilisateur = db.Column(db.Boolean, nullable=False, default=False)

    # Modifiable avec un formulaire prevu a cet effet
    mot_de_passe = db.Column(db.String(255), nullable=False)

    # Modifiable par l'utilisateur
    email = db.Column(db.String(1000), nullable=False)
    date_de_naissance = db.Column(db.String(100), nullable=True)
    surnom = db.Column(db.String(1000), nullable=True)
    ville_origine = db.Column(db.String(1000), nullable=True)
    telephone = db.Column(db.String(100), nullable=True)
    chambre = db.Column(db.String(1000), nullable=True)
    sports = db.Column(db.String(1000), nullable=True)
    instruments = db.Column(db.String(1000), nullable=True)
   
    # Gestion du parrainnage :
    # Une fonction sera prevue pour mofifier son marrain et fillot et faire en sorte que son parrain et fillot soit modifie en consequence. N'est pas mofifiable tel quel
    marrain_id = db.Column(db.Integer, nullable=True)
    marrain_nom = db.Column(db.String(1000), nullable=True)
    fillots_dict = db.Column(MutableDict.as_mutable(db.JSON), nullable=True)
    # le dictionnaire {fillot1_id : fillot_1_nom, fillot2_id : fillot2_nom, etc.}

    # Gestion des colocations - meme commentaire
    co_id = db.Column(db.Integer, nullable=True)
    co_nom = db.Column(db.String(1000), nullable=True)

    # Questions du portail - modifiable avec un formulaire
    questions_reponses_du_portail = db.Column(MutableDict.as_mutable(db.JSON), nullable=True)
    # Exemple = { "trash to co" : "Il pue", "Quelles assos comptes-tu faire ?" : "Le WEIIIII" }

    # Liste des assos - Non modifiable
    assos_actuelles = db.Column(MutableDict.as_mutable(db.JSON), nullable=True)
    # clef : id de l'asso, contenu : role(s). Ce role sera le meme que dans la table de l'asso
    # Exemple = { 101 : "Trez, VP fraude fiscale" } 
    anciennes_assos = db.Column(MutableDict.as_mutable(db.JSON), nullable=True)
    # clef : id de l'asso, contenu : (mandat, role(s)). Ce role sera le meme que dans la table des anciens mandats de l'asso
    # Exemple = { 101 : [23, "Trez, VP fraude fiscale"] } 

    # Sondages
    vote_sondaj_du_jour = db.Column(db.Integer, nullable=True)
    nombre_participations_sondaj = db.Column(db.Integer, nullable=False)
    nombre_victoires_sondaj = db.Column(db.Integer, nullable=False)

    # 2048
    # Apparaitra sur la page du 2048
    meilleur_score_2048 = db.Column(db.Integer, nullable=False)

    def __init__(self, nom_utilisateur:str, prenom:str, nom_de_famille:str, promotion:int, email:str, cycle:str, mot_de_passe_en_clair:str) :
        """
        Cree un nouvel utilisateur
        cycle doit etre "ic", "ast", "isup", "vs", "ev" ou "de" # pour matmaz
        """
        if verifier_chaine_nom_utilisateur(nom_utilisateur) :
            self.nom_utilisateur = nom_utilisateur
        else :
            raise ValueError("Nom d'utilisateur invalide")
        if verifier_chaine_prenom_nom(prenom) : 
            self.prenom = prenom
        else :
            raise ValueError("Prenom invalide")
        if verifier_chaine_prenom_nom(nom_de_famille) :
            self.nom_de_famille = nom_de_famille
        else :
            raise ValueError("Nom de famille invalide")
        self.promotion = promotion
        if cycle in {'ic', 'ast', 'vs', 'isup', 'ev', 'de'} :
            self.cycle = cycle 
        else :
            raise ValueError("Cycle invalide. doit etre dans {'ic', 'ast', 'vs', 'isup', 'ev', 'de'}")
        self.est_nouveau_a_la_mine = True
        self.est_visible = True
        self.est_vp_sondaj = False
        self.est_superutilisateur = False
        if verifier_chaine_mail(email):
            self.email = email
        else :
            raise ValueError("Mail invalide")
        self.mot_de_passe = generate_password_hash(mot_de_passe_en_clair)
        self.nombre_participations_sondaj = 0 
        self.nombre_victoires_sondaj = 0
        self.meilleur_score_2048 = 0
    
    def __repr__(self):
        """
        Methode optionnelle, mais utile pour deboguer et afficher l'utilisateur.
        """
        return f"<Utilisateur {self.nom_utilisateur}>"
    
    def update(self, **kwargs) :
        """
        Modifie les valeurs d'un utilisateur, puis met a jour la base de donnee.
        Dans le cas du mdp, hash la chaine de caracteres donnee avant de l'enregistrer

        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class utilisateur

        /!\ Sauf exceptions la table utilisateur n'est pas vouee a etre modifiee a la main. 
        Cette fonction sera utilisee au sein de fonctions bien precises. 

        Les valeurs de la class qui ont "nullable=True" peuvent etre mise a None. 
        ----------------------

        - nom_utilisateur : str
            Au format 23nomdefamille. La mise sous ce format et ces regles precises ne sont pas verifiees par cette fonction.
        - prenom : str
        - nom_de_famille : str
            Contient les tirets, espaces, apostrophes, et accents. Premiere lettre de chaque nom en majscule. Autres caracteres interdits.
        - surnom : str
            Contient les tirets, espaces, apostrophes, et accents. Majuscules ou minuscules. Autres caracteres interdits.
        - promotion : int
            La promotion. Un numero de promotion est le nombre forme par le chiffre des dizaines et celui des unites d'une annee.
            Pour les nouveaux 1A, c'est l'annee de leur integration. Pour les 2A AST c'est l'annee de promo des 2A anciens 1A. 
            Pour les VS, c'est l'annee de promotion des 3A anciens 2A ou anciens cesuriens. Vaut None pour la DE
        - email : str
            Le mail au format des Mines. Cette verification n'est pas effctuee, un autre fonction existera pour generer le mail
            avec nom + prenom
        - cycle : str
            Donne des informations sur le cursus du mineur.
            Peut etre 'ic', 'ast', 'vs', 'isup', 'ev' ou 'de'.
        - est_nouveau_a_la_mine : bool
            Est mis a True pour tous les nouveaux arrivants. Passe a False apres la PR.
        - est_visible : bool
            True par defaut. Pour rendre invisible un utilisateur sans le supprimer de la base de donnees.
        - est_vp_sondaj : bool
            Les utilisateurs ayant ce tag a True peuvent valider et supprimer des sondages.
        - est_superutilisateur : bool
            Les superutilisateurs peuvent acceder aux pages d'administration du portail. 
            Ce tag n'est pas modifiable ici pour des raisons de securite.
        - mot_de_passe_non_hache: str
            Le mot de passe non chiffre de l'utilisateur. Sera chiffre par cette fonction.
        - date_de_naissance: str
            Au format 'AAAAMMJJ'.
        - ville_origine : str
            Peut contenir tirets, espaces, apostrophes, et accents. Premiere lettre de chaque nom en majscule.
        - telephone : str
            Au format "0612345678" ou "0033612345678" ou "+33612345678". En cas d'extension telephonique, ne verifie pas la validite
        - chambre : str
        - sports : str
        instruments : str
            Du texte, avec accents et caracteres speciaux autorises mais pas emojis. 
        
        ### Pour marrains, fillots et co, aucune correspondance n'est geree par cette fonction. 
        Cette fonctionnalite ne doit pas etre utilisee, sauf dans un cas bien precis. 

        - marrain_id : int
            L'id du marrain dans la table des utilisateurs
        - marrain_nom : str
            le nom du marrain au format "Prenom Nom". Aucune verification sur la correspondance id-nom n'est effectuee
        - fillots_dict : Le dictionnaire des fillots : {id : prenom nom}
            les noms des fillots au format "Prenom Nom". Aucune verification sur la correspondance id-nom n'est effectuee        
        - co_id : int 
            L'id du co. None pour les PAMs
        - co_nom : str
            Meme format que les autres noms

        - questions_reponses_du_portail : dict
            Les questions et les reponses au format {question1 : reponse1, question2 : reponse2, ...}
            Le dictionnaire contient du texte, pas d'emojis ou de caracteres speciaux. 
        
        /!\ Ne doivent pas etre utilise hors d'une fonction qui verifie la validite des id

        - assos_actuelles : dict
            clef : id de l'asso, contenu : role(s). Ce role sera le meme que dans la liste des roles dans la table de l'asso.
            Exemple = { 101 : "Trez, VP fraude fiscale" } 
        - anciennes_assos : dict
            Sous la forme suivante : {id_asso1 : [promo_du_mandat, roles], id_asso2 : [promo_du_mandat, roles], ...}
            Exemple : {101 : [23, "Trez"], 54 : [23, "Sec Gen, vp vert"]}
        
        - vote_sondaj_du_jour : int
            1, 2, 3 ou 4 selon le vote de l'utilisateur au sondaj du jour. 
        - nombre_participations_sondaj : int
            Sera incremente a chaque vote.
        - nombre_victoires_sondaj : int
            Sera incremente a minuit pour chaque utlisateur en fonction du vote qui a gagne.
        - meilleur_score_2048 : int
            Sera update a chaque partie ou le reccord est battu.
        - mot_de_passe : str
            Est hache puis modifie
        """
        for key, value in kwargs.items():
            if key == "nom_utilisateur" :
                if value != None and verifier_chaine_nom_utilisateur(value):
                    self.nom_utilisateur = value
                else :
                    raise ValueError(f"Non modifie. Le nom d'utilisateur '{value}' est invalide.")
            elif key == "prenom" :
                if value != None and verifier_chaine_prenom_nom(value) :
                    self.prenom = value
                else :
                    raise ValueError(f"Non modifie. Le prenom '{value}' est invalide.")
            elif key == "nom_de_famille" :
                if value != None and verifier_chaine_prenom_nom(value) :
                    self.nom_de_famille = value
                else :
                    raise ValueError(f"Non modifie. Le nom de famille '{value}' est invalide.")
            elif key == "promotion" : 
                self.promotion = value # None pour la DE
            
            elif key == "email" :
                if value != None and verifier_chaine_mail(value) :
                    self.email = value
                else :
                    raise ValueError(f"Non modifie. Le mail '{value}' est invalide.")
            elif key=="cycle" :
                if value in {'ic', 'ast', 'vs', 'isup', 'ev', 'de'} :
                    self.cycle = value
                else :
                    raise ValueError(f"Non modifie. '{value}' doit etre 'ic', 'ast', 'vs', 'isup', 'ev' ou 'de'")
            elif key=="est_nouveau_a_la_mine" :
                if isinstance(value, bool) :
                    self.est_nouveau_a_la_mine = value
                else :
                    raise ValueError(f"Non modifie. est_nouveau_a_la_mine doit etre un booleen")
            elif key=="est_visible" :
                if isinstance(value, bool) :
                    self.est_visible = value
                else :
                    raise ValueError(f"Non modifie. est_nouveau_a_la_mine doit etre un booleen")
            elif key=="est_vp_sondaj" :
                if isinstance(value, bool) :
                    self.est_vp_sondaj = value
                else :
                    raise ValueError(f"Non modifie. est_nouveau_a_la_mine doit etre un booleen")
            elif key=="date_de_naissance" :
                if value==None or valider_chaine_date_naissance(value) :
                    self.date_de_naissance = value
                else :
                    raise ValueError(f"Non modifie. date_de_naissance doit etre au format 'AAAAMMJJ'. Date donnee : {value}")
            elif key=="surnom" :
                if value==None or valider_chaine_surnom(value) :
                    self.surnom = value
                else :
                    raise ValueError(f"Non modifie. Le surnom '{value}' est invalide.")
            elif key=="ville_origine" :
                if value==None or verifier_chaine_prenom_nom(value) :
                    self.ville_origine = value
                else :
                    raise ValueError(f"Non modifie. La ville '{value}' est invalide.")
            elif key=="telephone" :
                if value==None or valider_chaine_telephone(value) :
                    self.telephone = value
                else :
                    raise ValueError(f"Non modifie. Le format du numero '{value}' n'est pas reconnu.")
            elif key=="chambre" :
                if value==None or valider_chaines_de_base(value) :
                    self.chambre = value
                else :
                    raise ValueError(f"Non modifie. Caracteres interdits dans '{value}'.")
            elif key=="sports" :
                if value==None or valider_chaines_de_base(value) :
                    self.sports = value
                else :
                    raise ValueError(f"Non modifie. Caracteres interdits dans '{value}'.")
            elif key=="instruments" :
                if value==None or valider_chaines_de_base(value) :
                    self.instruments = value
                else :
                    raise ValueError(f"Non modifie. Caracteres interdits dans '{value}'.")
            elif key=="fillots_dict" :
                if value==None or valider_dict_fillots(value) :
                    self.fillots_dict = value
            elif key=="marrain_id" :
                if value==None or isinstance(value, int) :
                    self.marrain_id = value
                else :
                    raise ValueError(f"Non modifie. marrain_id doit etre un int")
            elif key=="co_id" :
                if value==None or isinstance(value, int) :
                    self.co_id = value
                else :
                    raise ValueError(f"Non modifie. co_id doit etre un int")
            elif key=="marrain_nom" :
                if value==None or verifier_chaine_prenom_nom(value) :
                    self.marrain_nom = value
                else :
                    raise ValueError(f"Non modifie. {value} ne respecte pas le format de nom.")
            elif key=="co_nom" :
                if value==None or verifier_chaine_prenom_nom(value) :
                    self.co_nom = value
                else :
                    raise ValueError(f"Non modifie. {value} ne respecte pas le format de nom.")
            elif key=="questions_reponses_du_portail" :
                if value == None or valider_questions_du_portail(value) :
                    self.questions_reponses_du_portail = value
            elif key=="assos_actuelles" :
                if value==None or valider_assos_roles(value):
                    self.assos_actuelles = value
                else :
                    raise ValueError("Erreur du format des donnees pour assos_actuelles. Le format a respecter est :\n \
                                    { 101 : \"Trez, VP fraude fiscale\"}") 
            elif key=="anciennes_assos" :
                if value==None or valider_anciennes_assos(value):
                    self.anciennes_assos = value
                else :
                    raise ValueError("Erreur du format des donnees pour anciennes_assos. Le format a respecter est :\n \
                                    {id_asso1 : [promo_du_mandat, roles], id_asso2 : [promo_du_mandat, roles], ...}\n \
                                    Exemple : {101 : [23, \"Trez\"], 54 : [23, \"Sec Gen, vp vert\"]}")
            elif key=="vote_sondaj_du_jour" :
                if value==None or value in {1,2,3,4} :
                    self.vote_sondaj_du_jour = value
                else :
                    raise ValueError("Le vote au sondage du jour doit etre 1, 2, 3 ou 4")
            elif key=="nombre_participations_sondaj" :
                if value != None :
                    self.nombre_participations_sondaj = value
            elif key=="nombre_victoires_sondaj" :
                if value != None :
                    self.nombre_victoires_sondaj = value
            elif key=="meilleur_score_2048" :
                if value != None :
                    self.meilleur_score_2048 = value
            elif key=="mot_de_passe_non_hache" : 
                if value != None :
                    self.mot_de_passe = generate_password_hash(value)
            else :
                raise KeyError("L'attribut {key} n'existe pas.")

        # reste a implementer la partie modif de mdp
        # pas de db.session.commit() ici

# LA LOGIQUE DES ASSOCIATIONS
# L'association fait appel également à des classes pour les publications et les commentaires
# Les classes Publication, Association et Évènements sont réliées par les photos associées
# À création d'une publication, un dossier est créé pour stocker les photos associées
# À suppression d'une publication, le dossier est supprimé

#À création d'un évènement, un dossier est créé pour stocker les photos associées
#À suppression d'un évènement, le dossier est supprimé

#L'architecture des dossiers est la suivante :
#/static / associations

#           		| —————— / publications
#			|				|
#			|				| ———————— /{publication_date}_{publication_heure}
#			|
#			| —————- / évènements
#							|
#							| ———————— /{evenement_date}_{evenement_heure}

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

    def __init__(self, id_association:int, id_auteur : int, contenu:str, date_publication:str,is_commentable:bool, a_cacher_to_cycles:list, a_cacher_to_promos:list, is_publication_interne:bool, is_publiee_par_utilisateur:bool=False) :
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

    def add_comment(self, auteur:int, contenu:str, date:str) :
        """
        Ajoute un commentaire à la publication
        """
        self.commentaires.append(Commentaire(auteur, contenu, date))

    def remove_comment(self, id_commentaire:int) :
        """
        Retire un commentaire de la publication
        """
        del self.commentaires[id_commentaire]


class Association(db.Model):
    __tablename__ = 'associations'
    #ID de l'association
    id = db.Column(db.Integer, primary_key=True)

    #Éléments ajoutés à la création de l'association — Modifiables par les membres de l'association
    nom = db.Column(db.String(1000), nullable=True)
    description = db.Column(db.String(1000), nullable=True)

    #Liste des membres de l'association
    membres = db.Column(db.JSON, nullable=True)

    #Liste des publications de l'association à afficher la page de l'association et sur le fil d'actualité, il s'agit d'une liste de dictionnaires
    publications = db.Column(db.JSON, nullable=True)
    
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
        self.create_association_folder()

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


# LA LOGIQUE DES SONDAGES
# 
# Il y a quatre elements de la BDD qui gerent les sondages :
# - la table 'sondages_en_attente' qui contient tous les sondages non publies : valides et en attente, leurs questions, leurs reponses, 
# - la table 'anciens_sondages' qui contient tous les sondages parrus, leurs reponses et le vote par reponse
# - la variable globale 'id_sondage_du_jour' qui contient l'id dans 'sondage_en_attente' du sondage actuellement publie
# - la table 'votes_sondage_du_jour' qui contient les id des utilisateurs votant et leur reponse au sondage du jour     

class Sondage(db.Model):
    """
    Cette classe sert a stocker les nouveaux sondages, non encore publies, 
    et le sondage du jour. 
    L'id du sondage du jour est stocke dans la table des variables globales 
    Les votes du jour sont stockes dans la table 'votes_sondage_du_jour'
    Un sondage ne peut parraitre que si son tag "est_valide" est a True
    La route pour appeler la fonction qui modifiera ca sera protegee par le decorateur @vp_sondaj_required
   """
    __tablename__ = 'sondages'
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    question = db.Column(db.String(1000), nullable=False)
    # reponses possibles
    reponse1 = db.Column(db.String(500), nullable=False)
    reponse2 = db.Column(db.String(500), nullable=False)
    reponse3 = db.Column(db.String(500), nullable=True) # on peut avoir 2 3 ou 4 reponses
    reponse4 = db.Column(db.String(500), nullable=True)
    # donnees du sondage
    propose_par_user_id = db.Column(db.Integer, nullable=False)
    date_sondage = db.Column(db.String(20), nullable=False) # au format AAAAMMJJHHMM
    # Autorisations
    status = db.Column(db.Boolean, nullable=False, default=False) # False : non autorise, True : en attente de publciation ou sondage du jour
    def __init__(self, propose_par_user_id:int, date_sondage:str, question:str, reponse1:str, reponse2:str, reponse3:str=None, reponse4:str=None) :
        """
        Cree un nouveau sondage
        """
        self.propose_par_user_id = propose_par_user_id
        if valider_date_AAAAMMJJHHMM(date_sondage):
            self.date_sondage = date_sondage
        else :
            raise ValueError("Fomat invalide de date")
        self.question = question
        self.reponse1 = reponse1
        self.reponse2 = reponse2
        self.reponse3 = reponse3
        self.reponse4 = reponse4
        self.status = False

class AncienSondage(db.Model):
    """
    Table des anciens sondages : contient la date de publication, l'utilisateur 
    ayant propose, la question, les reponses, le nombre de votes par reponse
    """
    __tablename__ = 'anciens_sondages'
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    question = db.Column(db.String(1000), nullable=False)
    # reponses possibles
    reponse1 = db.Column(db.String(500), nullable=False)
    reponse2 = db.Column(db.String(500), nullable=False)
    reponse3 = db.Column(db.String(500), nullable=True) # on peut avoir 2 3 ou 4 reponses
    reponse4 = db.Column(db.String(500), nullable=True)
    # donnees du sondage
    propose_par_user_id = db.Column(db.Integer, nullable=False)
    date_de_publication = db.Column(db.String(20), nullable=False) # au format AAAAMMJJHHMM
    # nombre de votes pour chaque reponse
    votes1 = db.Column(db.Integer, nullable=False, default=0)
    votes2 = db.Column(db.Integer, nullable=False, default=0)
    votes3 = db.Column(db.Integer, nullable=False, default=0)
    votes4 = db.Column(db.Integer, nullable=False, default=0)

    def __init__(self, propose_par_user_id:int, date_de_publication:str, question:str, reponse1:str, reponse2:str, reponse3:str, reponse4:str, votes1:int, votes2:int, votes3:int, votes4:int) :
        """
        Cree un nouveau "ancien_sondage" (sera appele a partir des donnees du sondage du jour)
        """
        self.propose_par_user_id = propose_par_user_id
        if valider_date_AAAAMMJJHHMM(date_de_publication):
            self.date_de_publication = date_de_publication
        else :
            raise ValueError("Fomat invalide de date")
        self.question = question
        self.reponse1 = reponse1
        self.reponse2 = reponse2
        self.reponse3 = reponse3
        self.reponse4 = reponse4
        self.votes1 = votes1
        self.votes2 = votes2
        self.votes3 = votes3
        self.votes4 = votes4

class VoteSondageDuJour(db.Model):
    """
    Contient les utilisateurs ayant vote au sondage du jour, et leur vote
    """
    __tablename__ = 'votes_sondage_du_jour'
    id = db.Column(db.Integer, primary_key=True)  # Clef primaire
    id_utilisateur = db.Column(db.Integer, nullable=False)
    numero_vote = db.Column(db.Integer, nullable=False)

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

    jours_de_la_semaine = db.Column(db.String(100), nullable=True)

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

        self.create_evenement_folder()

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
