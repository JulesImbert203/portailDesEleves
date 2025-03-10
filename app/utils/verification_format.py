# verification_format.py
# Ici sont les fonctions utilisees dans models.py pour verifier que les donnees sont bien sous
# le bon format 

# ----------- FONCTIONS DE VERIFICATION DU FORMAT DES DONNEES
#
# Ne verifie pas leur validite / coherence
import re
from datetime import datetime

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

def valider_date_AAAAMMJJHHMM(date_str: str) -> bool:
    return re.fullmatch(r"\d{12}", date_str)
