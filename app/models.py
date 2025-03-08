# Definition des modeles de base de donnees

from app import db
from sqlalchemy.ext.mutable import MutableDict
import re
from datetime import datetime
from flask_login import UserMixin # pour faire le lien entre la class utilisateur et flask_login
from werkzeug.security import generate_password_hash # Pour hacher les mdp 

# ----------- FONCTIONS DE VERIFICATION DU FORMAT DES DONNEES
#
# Ne verifie pas leur validite / coherence

def verifier_chaine_nom_utilisateur(chaine: str) -> bool:
    # verifie le respect des criteres du nom d'utilisateur
    return bool(re.fullmatch(r"[a-z0-9-]+", chaine))

def verifier_chaine_prenom_nom(chaine: str) -> bool:
    return bool(re.fullmatch(r"[a-zA-Zà-ÿ'\s-]+", chaine)) and all(mot[0].isupper() for mot in chaine.split())

def verifier_chaine_mail(chaine: str) -> bool:
    return bool(re.fullmatch(r"[a-z0-9._@-]+", chaine))

def valider_chaine_date_naissance(chaine: str) -> bool:
    # Verifier si la chaine est bien au format 'AAAAMMJJ'
    if not re.fullmatch(r"\d{8}", chaine):
        return False
    try:
        datetime.strptime(chaine, "%Y%m%d")
        return True
    except ValueError:
        return False
def valider_chaine_surnom(chaine: str) -> bool:
    return bool(re.fullmatch(r"[\wÀ-ÿ!@#$%^&*()_+={}\[\]:;\"'<>,.?/\\|\-\s]+", chaine))                             

def valider_chaine_telephone(chaine: str) -> bool:
    return bool(re.fullmatch(r"(\+?\d{1,3}|00\d{1,3})?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}", chaine))

def valider_chaines_de_base(chaine: str) -> bool:
    """
    Accepte toutes les chaines de bases, hors emojis et caracteres d'autres langues
    """
    pattern = r'^[\w\s\u00C0-\u00FF\u20AC\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029\u002A\u002B\u002C\u002D\u002E\u002F\u003A\u003B\u003C\u003D\u003E\u003F\u0040\u005B\u005D\u005E\u005F\u0060\u007B\u007C\u007D\u007E\u0021-\u007E]+$'
    return re.match(pattern, chaine)

def valider_questions_du_portail(dictionnaire: dict) -> bool:
    for cle, contenu in dictionnaire.items():
        if not valider_chaines_de_base(cle) or not valider_chaines_de_base(contenu):
            return False
    return True

def valider_assos_roles(dictionnaire: dict) -> bool:
    for cle, contenu in dictionnaire.items():
        if not isinstance(cle, int) or not valider_chaines_de_base(contenu):
            return False
    return True

def valider_anciennes_assos(dictionnaire: dict) -> bool :
    for cle, contenu in dictionnaire.items():
        if not isinstance(cle, int) or not isinstance(contenu, list) or len(contenu) != 2:
            return False
        if not isinstance(contenu[0], int) or not valider_chaines_de_base(contenu[1]):
            return False
    return True

def valider_dict_fillots(dictionnaire: dict) -> bool :
    for cle, contenu in dictionnaire.items():
        if isinstance(cle, int) and isinstance(contenu, str) :
            if not verifier_chaine_prenom_nom(contenu) :
                return False
        else : 
            return False
    return True

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
    

class Publication():
    def __init__(self, auteur:int, contenu:str, date:str, liste_images:list) :
        """
        Crée une nouvelle publication
        """
        self.auteur = auteur
        self.contenu = contenu
        self.date = date
        self.liste_images = liste_images
        self.likes = []
        self.commentaires = []
    
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
    
    def remove_comment(self, index:int) :
        """
        Retire un commentaire de la publication
        """
        del self.commentaires[index]
    


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
    
    def add_member(self, id_utilisateur:int, role:str) :
        """
        Ajoute un membre à l'association
        """
        utilisateur = Utilisateur.query.get(id_utilisateur)
        if utilisateur:
            membre = {
                'id': utilisateur.id,
                'role': role
            }
            self.membres.append(membre)
            utilisateur.assos_actuelles[self.id] = role

            db.session.commit()
        else:
            raise ValueError(f"Utilisateur avec id {id_utilisateur} n'existe pas.")
    
    def remove_member(self, id_utilisateur:int) :
        """
        Retire un membre de l'association
        """
        self.membres = [membre for membre in self.membres if membre['id'] != id_utilisateur]
        utilisateur = Utilisateur.query.get(id_utilisateur)
        if utilisateur:
            del utilisateur.assos_actuelles[self.id]

            db.session.commit()

    def update_member_role(self, id_utilisateur:int, role:str) :
        """
        Modifie le role d'un membre de l'association
        """
        for membre in self.membres:
            if membre['id'] == id_utilisateur:
                membre['role'] = role
                break
        utilisateur = Utilisateur.query.get(id_utilisateur)
        if utilisateur:
            utilisateur.assos_actuelles[self.id] = role

            db.session.commit()

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

    def update_members_order(self, members_weights:list,members : list) :
        """
        Modifie l'ordre des membres de l'association en fonction de leur poids
        """
        ordre=[[i, members_weights[i],members[i].nom_utilisateur] for i in range(len(members_weights))]

        #tri weight décroissant puis nom croissant
        ordre.sort(key=lambda x: (-x[1], x[2]))
        self.membres=[members[i] for i in ordre]

    def add_publication(self, auteur:int, contenu:str, date:str, liste_images:list) :
        """
        Ajoute une publication à l'association
        """
        self.publications.append(Publication(auteur, contenu, date, liste_images))

        db.session.commit()

    def remove_publication(self, index:int) :
        """
        Retire une publication de l'association
        """
        del self.publications[index]

        db.session.commit()

    def add_like(self, index:int, id_utilisateur:int) :
        """
        Ajoute un like à une publication de l'association
        """
        self.publications[index].add_like(id_utilisateur)

        db.session.commit()
    
    def remove_like(self, index:int, id_utilisateur:int) :
        """
        Retire un like d'une publication de l'association
        """
        self.publications[index].remove_like(id_utilisateur)

        db.session.commit()

    def add_comment(self, index:int, auteur:int, contenu:str, date:str) :
        """
        Ajoute un commentaire à une publication de l'association
        """
        self.publications[index].add_comment(auteur, contenu, date)

        db.session.commit()
    
    def remove_comment(self, index:int, index_comment:int) :
        """
        Retire un commentaire d'une publication de l'association
        """
        self.publications[index].remove_comment(index_comment)

        db.session.commit()

    
    
            



