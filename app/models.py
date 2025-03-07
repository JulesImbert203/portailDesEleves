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
    
    def update(self, 
               nom_utilisateur:str=None,
               prenom:str=None,
               nom_de_famille:str=None,
               promotion:int=None,
               email:str=None,
               cycle:str=None,
               est_nouveau_a_la_mine:bool=None,
               est_visible:bool=None,
               est_vp_sondaj:bool=None,
               mot_de_passe_non_hache:str=None,
               date_de_naissance:str=None,
               surnom:str=None,
               ville_origine:str=None,
               telephone:str=None,
               chambre:str=None,
               sports:str=None,
               instruments:str=None,
               marrain_id:int=None,
               marrain_nom:str=None,
               fillots_dict:dict=None,
               co_id:int=None,
               co_nom:str=None,
               questions_reponses_du_portail:dict=None,
               assos_actuelles:dict=None,
               anciennes_assos:dict=None,
               vote_sondaj_du_jour:int=None,
               nombre_participations_sondaj:int=None,
               nombre_victoires_sondaj:int=None,
               meilleur_score_2048:int=None) :
        """
        Modifie les valeurs d'un utilisateur, puis met a jour la base de donnee.
        Dans le cas du mdp, hash la chaine de caracteres donnee avant de l'enregistrer

        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class utilisateur

        /!\ Sauf exceptions la table utilisateur n'est pas vouee a etre modifiee a la main. 
        Cette fonction sera utilisee au sein de fonctions bien precises. 
        
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
        
        # Pour marrains, fillots et co, aucune correspondance n'est geree par cette fonction. 
        Cette fonctionnalite ne doit pas etre utilisee, sauf dans un cas bien precis. 
        marrain_id : int
            L'id du marrain dans la table des utilisateurs
        marrain_nom : str
            le nom du marrain au format "Prenom Nom". Aucune verification sur la correspondance id-nom n'est effectuee
        fillot_ids : [int, int, ...]
            L'id des fillots dans la table des utilisateurs
        fillot_noms : [str, str, ...]
            les noms des fillots au format "Prenom Nom", dans le meme ordre que les id. Aucune verification sur la correspondance id-nom n'est effectuee        
        co_id : int 
            L'id du co. None pour les PAMs
        co_nom : str
            Meme format que les autres noms

        questions_reponses_du_portail : dict
            Les questions et les reponses au format {question1 : reponse1, question2 : reponse2, ...}
            Le dictionnaire contient du texte, pas d'emojis ou de caracteres speciaux. 
        
        /!\ Ne doivent pas etre utilise hors d'une fonction qui verifie la validite des id

        assos_actuelles : dict
            clef : id de l'asso, contenu : role(s). Ce role sera le meme que dans la liste des roles dans la table de l'asso.
            Exemple = { 101 : "Trez, VP fraude fiscale" } 
        anciennes_assos : dict
            Sous la forme suivante : {id_asso1 : [promo_du_mandat, roles], id_asso2 : [promo_du_mandat, roles], ...}
            Exemple : {101 : [23, "Trez"], 54 : [23, "Sec Gen, vp vert"]}
        
        vote_sondaj_du_jour : int
            1, 2, 3 ou 4 selon le vote de l'utilisateur au sondaj du jour. 
        nombre_participations_sondaj : int
            Sera incremente a chaque vote.
        nombre_victoires_sondaj : int
            Sera incremente a minuit pour chaque utlisateur en fonction du vote qui a gagne.
        meilleur_score_2048 : int
            Sera update a chaque partie ou le reccord est battu.
        """
        if nom_utilisateur != None :
            if verifier_chaine_nom_utilisateur(nom_utilisateur) :
                self.nom_utilisateur = nom_utilisateur
            else :
                raise ValueError(f"Non modifie. Le nom d'utilisateur '{nom_utilisateur}' est invalide.")
        if prenom != None :
            if verifier_chaine_prenom_nom(prenom) :
                self.prenom = prenom
            else :
                raise ValueError(f"Non modifie. Le prenom '{prenom}' est invalide.")
        if nom_de_famille != None :
            if verifier_chaine_prenom_nom(nom_de_famille) :
                self.nom_de_famille = nom_de_famille
            else :
                raise ValueError(f"Non modifie. Le nom de famille '{nom_de_famille}' est invalide.")
        if promotion == None : # la DE
            self.promotion = promotion
        elif promotion >= 0 :
            self.promotion = promotion
        else :
            raise ValueError(f"Non modifie. La promotion entree ({promotion}) est invalide")
        if email != None :
            if verifier_chaine_mail(email) :
                self.email = email
            else :
                raise ValueError(f"Non modifie. Le mail '{email}' est invalide.")
        if cycle in {'ic', 'ast', 'vs', 'isup', 'ev', 'de'} :
            self.cycle = cycle
        else :
            raise ValueError(f"Non modifie. '{cycle}' doit etre 'ic', 'ast', 'vs', 'isup', 'ev' ou 'de'")
        if est_nouveau_a_la_mine != None :
            self.est_nouveau_a_la_mine = est_nouveau_a_la_mine
        if est_visible != None :
            self.est_visible = est_visible
        if est_vp_sondaj != None :
            self.est_vp_sondaj = est_vp_sondaj
        if date_de_naissance != None :
            if valider_chaine_date_naissance(date_de_naissance) :
                self.date_de_naissance = date_de_naissance
            else :
                raise ValueError(f"Non modifie. date_de_naissance doit etre au format 'AAAAMMJJ'. Date donnee : {date_de_naissance}")
        if surnom != None :
            if valider_chaine_surnom(surnom) :
                self.surnom = surnom
            else :
                raise ValueError(f"Non modifie. Le surnom '{surnom}' est invalide.")
        if ville_origine != None :
            if verifier_chaine_prenom_nom(ville_origine) :
                self.ville_origine = ville_origine
            else :
                raise ValueError(f"Non modifie. La ville '{ville_origine}' est invalide.")
        if telephone != None :
            if valider_chaine_telephone(telephone) :
                self.telephone = telephone
            else :
                raise ValueError(f"Non modifie. Le format du numero '{telephone}' n'est pas reconnu.")
        if chambre != None :
            if valider_chaines_de_base(chambre) :
                self.chambre = chambre
            else :
                raise ValueError(f"Non modifie. Caracteres interdits dans '{chambre}'.")
        if sports != None :
            if valider_chaines_de_base(sports) :
                self.sports = sports
            else :
                raise ValueError(f"Non modifie. Caracteres interdits dans '{sports}'.")
        if instruments != None :
            if valider_chaines_de_base(instruments) :
                self.instruments = instruments
            else :
                raise ValueError(f"Non modifie. Caracteres interdits dans '{instruments}'.")
        if fillots_dict != None :
            if valider_dict_fillots(fillots_dict) :
                self.fillots_dict = fillots_dict
        if marrain_id != None :
            self.marrain_id = marrain_id
        if co_id != None :
            self.co_id = co_id
        if marrain_nom != None :
            if verifier_chaine_prenom_nom(marrain_nom) :
                self.marrain_nom = marrain_nom
            else :
                raise ValueError(f"Non modifie. {marrain_nom} ne respecte pas le format de nom.")
        if co_nom != None :
            if verifier_chaine_prenom_nom(co_nom) :
                self.co_nom = co_nom
            else :
                raise ValueError(f"Non modifie. {co_nom} ne respecte pas le format de nom.")
        
        if questions_reponses_du_portail != None :
            if valider_questions_du_portail(questions_reponses_du_portail) :
                self.questions_reponses_du_portail = questions_reponses_du_portail

        if assos_actuelles != None :
            if valider_assos_roles(assos_actuelles):
                self.assos_actuelles = assos_actuelles
            else :
                raise ValueError("Erreur du format des donnees pour assos_actuelles. Le format a respecter est :\n \
                                 { 101 : \"Trez, VP fraude fiscale\"}") 
        if anciennes_assos != None :
            if valider_anciennes_assos(anciennes_assos):
                self.anciennes_assos = anciennes_assos
            else :
                raise ValueError("Erreur du format des donnees pour anciennes_assos. Le format a respecter est :\n \
                                 {id_asso1 : [promo_du_mandat, roles], id_asso2 : [promo_du_mandat, roles], ...}\n \
                                 Exemple : {101 : [23, \"Trez\"], 54 : [23, \"Sec Gen, vp vert\"]}")

        if vote_sondaj_du_jour != None :
            if vote_sondaj_du_jour in {1,2,3,4} :
                self.vote_sondaj_du_jour = vote_sondaj_du_jour
            else :
                raise ValueError("Le vote au sondage du jour doit etre 1, 2, 3 ou 4")

        if nombre_participations_sondaj != None :
            self.nombre_participations_sondaj = nombre_participations_sondaj
        if nombre_victoires_sondaj != None :
            self.nombre_victoires_sondaj = nombre_victoires_sondaj
        if meilleur_score_2048 != None :
            self.meilleur_score_2048 = meilleur_score_2048

        # reste a implementer la partie modif de mdp

class Association(db.Model):
    __tablename__ = 'associations'
    #ID de l'association
    id = db.Column(db.Integer, primary_key=True)

    #Éléments ajoutés à la création de l'association — Modifiables par les membres de l'association
    nom = db.Column(db.String(1000), nullable=True)
    description = db.Column(db.String(1000), nullable=True)

    #Liste des membres de l'association
    membres = db.Column(MutableDict.as_mutable(db.JSON), nullable=True)

    #Liste des publications de l'association à afficher la page de l'association et sur le fil d'actualité, il s'agit d'une liste de dictionnaires
    publications = db.Column(db.JSON, nullable=True)
    
    #Liste des événements de l'association à afficher sur le calendrier
    evenements = db.Column(db.JSON, nullable=True)

    type_association = db.Column(db.String(1000), nullable=True)

    ordre_importance = db.Column(db.Integer, nullable=True)

    def __init__(self, nom:str, description:str,type_association:str) :
        """
        Crée une nouvelle association
        """
        self.nom = nom
        self.description = description
        self.membres = {}
        self.publications = []
        self.evenements = []
        self.type_association = type_association

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
        - publications : liste de dictionnaires
            Liste des publications de l'association au format :
              [{auteur : id_utilisateur, 
                contenu : texte, 
                date : AAAAMMJJHHMM, 
                liste_images :[image1, image2, ...]}, 
                likes : [id_utilisateur1, id_utilisateur2, ...], 
                commentaires : [{auteur : id_utilisateur, contenu : texte, date : AAAAMMJJHHMM}, ...]}]
            auteur est l'id de l'utilisateur, contenu est le texte de la publication, 
            date est la date de publication, liste_images est la liste des images de la 
            publication, likes est la liste des id des utilisateurs ayant liké la publication, 
            commentaires est la liste des commentaires de la publication.
        - evenements : liste des évènements à venir de l'association au format :
            [{nom : nom_evenement, 
              date : AAAAMMJJHHMM, 
              lieu : lieu_evenement, 
              description : description_evenement, 
            nom est le nom de l'évènement, date est la date de l'évènement, 
            lieu est le lieu de l'évènement, description est la description de l'évènement, 
            liste_images est la liste des images de l'évènement.
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
        self.membres[id_utilisateur] = role

    def remove_member(self, id_utilisateur:int) :
        """
        Retire un membre de l'association
        """
        del self.membres[id_utilisateur]

    def add_publication(self, auteur:int, contenu:str, date:str, liste_images:list) :
        """
        Ajoute une publication à l'association
        """
        self.publications.append({'auteur': auteur, 'contenu': contenu, 'date': date, 'liste_images': liste_images, 'likes': [], 'commentaires': []})
    
    def remove_publication(self, index:int) :
        """
        Retire une publication de l'association
        """
        del self.publications[index]
    
    def add_like(self, index:int, id_utilisateur:int) :
        """
        Ajoute un like à une publication
        """
        self.publications[index]['likes'].append(id_utilisateur)
    
    def remove_like(self, index:int, id_utilisateur:int) :
        """
        Retire un like d'une publication
        """
        self.publications[index]['likes'].remove(id_utilisateur)
    
    def add_comment(self, index:int, auteur:int, contenu:str, date:str) :
        """
        Ajoute un commentaire à une publication
        """
        self.publications[index]['commentaires'].append({'auteur': auteur, 'contenu': contenu, 'date': date})
    
    def remove_comment(self, index:int, index_comment:int) :
        """
        Retire un commentaire d'une publication
        """
        del self.publications[index]['commentaires'][index_comment]
    
    def add_event(self, nom:str, date:str, lieu:str, description:str, liste_images:list) :
        """
        Ajoute un évènement à l'association
        """
        self.evenements.append({'nom': nom, 'date': date, 'lieu': lieu, 'description': description, 'liste_images': liste_images})
    
    def remove_event(self, index:int) :
        """
        Retire un évènement de l'association
        """
        del self.evenements[index]
    
    def update_event(self, index:int, nom:str=None, date:str=None, lieu:str=None, description:str=None, liste_images:list=None) :
        """
        Modifie un évènement de l'association
        """
        if nom != None :
            self.evenements[index]['nom'] = nom
        if date != None :
            self.evenements[index]['date'] = date
        if lieu != None :
            self.evenements[index]['lieu'] = lieu
        if description != None :
            self.evenements[index]['description'] = description
        if liste_images != None :
            self.evenements[index]['liste_images'] = liste_images
            



