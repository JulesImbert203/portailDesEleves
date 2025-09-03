from app import db
from sqlalchemy.ext.mutable import MutableDict
from flask_login import UserMixin # pour faire le lien entre la class utilisateur et flask_login
from werkzeug.security import generate_password_hash # Pour hacher les mdp 

# verification du format des donnees :
from ..utils.verification_format import *

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
    est_baptise = db.Column(db.Boolean, nullable=False)

    # Gestion des colocations - meme commentaire
    co_id = db.Column(db.Integer, nullable=True)
    co_nom = db.Column(db.String(1000), nullable=True)

    # Questions du portail - modifiable avec un formulaire
    questions_reponses_du_portail = db.Column(MutableDict.as_mutable(db.JSON), nullable=True)
    # Exemple = { "trash to co" : "Il pue", "Quelles assos comptes-tu faire ?" : "Le WEIIIII" }

    # Liste des assos actuelles
    associations_actuelles = db.relationship('AssociationMembre', back_populates='utilisateur')

    # Liste des assos anciennes
    associations_anciennes = db.relationship('AssociationAncienMembre', back_populates='utilisateur')

    # Sondages
    vote_sondaj_du_jour = db.Column(db.Integer, nullable=True)
    nombre_participations_sondaj = db.Column(db.Integer, nullable=False)
    nombre_victoires_sondaj = db.Column(db.Integer, nullable=False)

    # 2048
    # Apparaitra sur la page du 2048
    meilleur_score_2048 = db.Column(db.Integer, nullable=False)

    # soifguard
    solde_octo = db.Column(db.Numeric(10, 2), nullable=False, default=0)  # Arrondi à 2 décimales
    solde_biero = db.Column(db.Numeric(10, 2), nullable=True, default=0)  # Arrondi à 2 décimales
    est_cotisant_biero = db.Column(db.Integer, nullable=False, default=False)
    est_cotisant_octo = db.Column(db.Integer, nullable=False, default=False)

    # Publications
    publications = db.relationship('Publication', back_populates='auteur')
    # Commentaires
    commentaires = db.relationship('Commentaire', back_populates='auteur')

    def __init__(self, nom_utilisateur:str, prenom:str, nom_de_famille:str, promotion:int, email:str, cycle:str, mot_de_passe_en_clair:str) :
        """
        Cree un nouvel utilisateur
        cycle doit etre "ic", "ast", "isup", "vs", "ev" ou "de" # pour matmaz
        """
        if verifier_chaine_nom_utilisateur(nom_utilisateur) :
            self.nom_utilisateur = nom_utilisateur
        else :
            raise ValueError(f"Nom d'utilisateur invalide : {nom_utilisateur}")
        if verifier_chaine_prenom_nom(prenom) : 
            self.prenom = prenom
        else :
            raise ValueError(f"Prenom invalide : {prenom}")
        if verifier_chaine_prenom_nom(nom_de_famille) :
            self.nom_de_famille = nom_de_famille
        else :
            raise ValueError(f"Nom de famille invalide : {nom_de_famille}")
        self.promotion = promotion
        if cycle in {'ic', 'ast', 'vs', 'isup', 'ev', 'de'} :
            self.cycle = cycle 
        else :
            raise ValueError("Cycle invalide. doit etre dans {'ic', 'ast', 'vs', 'isup', 'ev', 'de'}")
        self.est_nouveau_a_la_mine = True
        self.est_visible = True
        self.est_vp_sondaj = False
        self.est_superutilisateur = False
        self.est_baptise = False
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
        - publications : liste d'objets Publication
            Liste des publications d'utilisateur
        
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

