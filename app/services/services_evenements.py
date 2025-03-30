from app.services import db
from app.models.models_evenements import Evenement
from datetime import datetime, timedelta

def est_date_AAAAMMJJ(date_str):
    try:
        datetime.strptime(date_str, "%Y%m%d")
        return True
    except ValueError:
        return False
    
### Gestion des evenements

def change_event_visibility(evenement:Evenement):
    """Change la visibilité d'un évènement"""
    if evenement:
        evenement.evenement_masque = not evenement.evenement_masque
        db.session.commit()

def supprimer_evenement(evenement: Evenement) :
    """Supprime un evenement"""
    if evenement:
        db.session.delete(evenement)
        db.session.commit()
        

# Obtention des listes d'évènements 


def get_evenements_par_date(date_str:str):
    """
    Récupère les événements en fonction d'une date fournie.
    
    - "ajd" : événements du jour
    - "week" : événements de la semaine en cours (du lundi au dimanche)
    - "AAAAMMJJ" : événements du jour spécifié
    - "AAAAMM" : événements du mois spécifié
    - "AAAA" : événements de l'année spécifiée (sans événements périodiques)
    """
    now = datetime.now()
    annee_actuelle = now.strftime("%Y")
    if date_str == "ajd":
        date_filtre = now.strftime("%Y%m%d")
        return _filtrer_par_jour(date_filtre, include_periodiques=True)
    elif date_str == "week":
        return _filtrer_par_semaine()
    elif len(date_str) == 8:  # Format AAAAMMJJ
        include_periodiques = date_str[:4] == annee_actuelle
        return _filtrer_par_jour(date_str, include_periodiques)
    elif len(date_str) == 6:  # Format AAAAMM
        include_periodiques = date_str[:4] == annee_actuelle
        return _filtrer_par_mois(date_str, include_periodiques)
    elif len(date_str) == 4:  # Format AAAA
        return _filtrer_par_annee(date_str)
    else:
        raise ValueError("Format de date invalide. Utilisez 'ajd', 'week', 'AAAAMMJJ', 'AAAAMM' ou 'AAAA'.")

def _filtrer_par_jour(date_filtre, include_periodiques):
    """ Récupère les événements d'un jour précis """
    jour_semaine = _jour_de_semaine(date_filtre)
    evenements = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        ((Evenement.date_de_debut.like(f"{date_filtre}%")) | (Evenement.date_de_fin.like(f"{date_filtre}%")))
    ).all()
    if include_periodiques:
        evenements_periodiques = Evenement.query.filter(
            Evenement.evenement_masque == False,
            Evenement.evenement_periodique == True,
            Evenement.jours_de_la_semaine.contains([jour_semaine])
        ).all()
        # Exclure les événements périodiques annulés
        evenements_periodiques = [evt for evt in evenements_periodiques if date_filtre not in evt.dates_annulation]
        return evenements + evenements_periodiques
    return evenements

def _filtrer_par_semaine():
    """ Récupère les événements de la semaine actuelle (lundi-dimanche) """
    now = datetime.now()
    lundi = now - timedelta(days=now.weekday())  # Premier jour de la semaine
    dates_semaine = [(lundi + timedelta(days=i)).strftime("%Y%m%d") for i in range(7)]
    jours_semaine = [_jour_de_semaine(date) for date in dates_semaine]
    evenements = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        ((Evenement.date_de_debut.between(dates_semaine[0], dates_semaine[-1])) | 
         (Evenement.date_de_fin.between(dates_semaine[0], dates_semaine[-1])))
    ).all()
    evenements_periodiques = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == True
    ).all()
    evenements_periodiques = [
        evt for evt in evenements_periodiques
        if any(jour in evt.jours_de_la_semaine for jour in jours_semaine)
        and not any(date in evt.dates_annulation for date in dates_semaine)
    ]
    return evenements + evenements_periodiques

def _filtrer_par_mois(date_filtre_mois, include_periodiques):
    """ Récupère tous les événements d'un mois donné """
    evenements = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        ((Evenement.date_de_debut.like(f"{date_filtre_mois}%")) | (Evenement.date_de_fin.like(f"{date_filtre_mois}%")))
    ).all()
    if include_periodiques:
        evenements_periodiques = Evenement.query.filter(
            Evenement.evenement_masque == False,
            Evenement.evenement_periodique == True
        ).all()
        evenements_periodiques = [
            evt for evt in evenements_periodiques
            if not any(date.startswith(date_filtre_mois) for date in evt.dates_annulation)
        ]
        return evenements + evenements_periodiques
    return evenements

def _filtrer_par_annee(date_filtre_annee):
    """ Récupère tous les événements d'une année donnée (sans événements périodiques) """
    return Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        ((Evenement.date_de_debut.like(f"{date_filtre_annee}%")) | (Evenement.date_de_fin.like(f"{date_filtre_annee}%")))
    ).all()

def _jour_de_semaine(date_str):
    """ Convertit une date AAAAMMJJ en jour de la semaine (ex: 'lundi') """
    date_obj = datetime.strptime(date_str, "%Y%m%d")
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    return jours[date_obj.weekday()]
