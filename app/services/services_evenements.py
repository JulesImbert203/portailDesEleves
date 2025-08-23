from app.services import db
from app.models.models_evenements import Evenement
from datetime import datetime, timedelta, time


def est_heure_HHMM(heure_str):
    try:
        datetime.strptime(heure_str, "%H:%M")
        return True
    except ValueError:
        return False


def est_date_AAAAMMJJHHMM(date_str):
    try:
        datetime.strptime(date_str, "%Y%m%d%H%M")
        return True
    except ValueError:
        return False


def est_valide_liste_de_jours(liste_jours):
    for jour in liste_jours:
        if jour not in ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']:
            return False
    return True


def est_date_AAAAMMJJ(date_str):
    try:
        datetime.strptime(date_str, "%Y%m%d")
        return True
    except ValueError:
        return False

# Gestion des evenements


def change_event_visibility(evenement: Evenement):
    """Change la visibilité d'un évènement"""
    if evenement:
        evenement.evenement_masque = not evenement.evenement_masque
        db.session.commit()


def supprimer_evenement(evenement: Evenement):
    """Supprime un evenement"""
    if evenement:
        db.session.delete(evenement)
        db.session.commit()


def verifier_format(data):
    """
    Vérifie le format des données d'un événement reçues d'une API.
    """
    try:
        est_periodique = data["evenement_periodique"]
        if est_periodique:
            jours = data["jours_de_la_semaine"]
            heure_debut = data["heure_de_debut"]
            heure_fin = data["heure_de_fin"]
            if not isinstance(jours, list) or not est_valide_liste_de_jours(jours):
                raise ValueError("le format de jours_de_la_semaine est invalide")
            if not est_heure_HHMM(heure_debut) or not est_heure_HHMM(heure_fin):
                raise ValueError("le format de heure_debut ou heure_fin est invalide")
        else:
            date_debut = data["date_de_debut"]
            date_fin = data["date_de_fin"]
            datetime.fromisoformat(date_debut)
            datetime.fromisoformat(date_fin)

        return {"valide": True, "message": ""}

    except KeyError as e:
        return {"valide": False, "message": f"Missing key: {e}"}
    except (ValueError, TypeError) as e:
        return {"valide": False, "message": str(e)}
    except Exception as e:
        return {"valide": False, "message": f"Erreur: {e}"}

# Obtention des listes d'évènements


def get_evenements_par_date(date_str: str):
    """
    Récupère les événements en fonction d'une date fournie.

    - "ajd" : événements du jour
    - "week" : événements de la semaine en cours (du lundi au dimanche)
    - "AAAAMMJJ" : événements du jour spécifié
    - "AAAAMM" : événements du mois spécifié
    - "AAAA" : événements de l'année spécifiée (sans événements périodiques)
    """
    now = datetime.now()
    if date_str == "ajd":
        return _filtrer_par_jour(now.date(), include_periodiques=True)
    elif date_str == "week":
        return _filtrer_par_semaine()
    elif len(date_str) == 8:  # Format AAAAMMJJ
        date_obj = datetime.strptime(date_str, "%Y%m%d").date()
        include_periodiques = date_obj.year == now.year
        return _filtrer_par_jour(date_obj, include_periodiques)
    elif len(date_str) == 6:  # Format AAAAMM
        year_month = datetime.strptime(date_str, "%Y%m").date()
        include_periodiques = year_month.year == now.year
        return _filtrer_par_mois(year_month, include_periodiques)
    elif len(date_str) == 4:  # Format AAAA
        return _filtrer_par_annee(date_str)
    else:
        raise ValueError(
            "Format de date invalide. Utilisez 'ajd', 'week', 'AAAAMMJJ', 'AAAAMM' ou 'AAAA'.")


def _filtrer_par_jour(date_filtre: datetime.date, include_periodiques: bool):
    """ Récupère les événements d'un jour précis """
    jour_semaine = _jour_de_semaine(date_filtre.strftime("%Y%m%d"))
    evenements = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        db.cast(Evenement.date_de_debut, db.Date) == date_filtre
    ).all()
    if include_periodiques:
        evenements_periodiques = Evenement.query.filter(
            Evenement.evenement_masque == False,
            Evenement.evenement_periodique == True,
            Evenement.jours_de_la_semaine.contains([jour_semaine])
        ).all()
        evenements_periodiques = [evt for evt in evenements_periodiques if date_filtre.strftime(
            "%Y%m%d") not in evt.dates_annulation]
        return evenements + evenements_periodiques

    return evenements


def _filtrer_par_semaine():
    """ Récupère les événements de la semaine actuelle (lundi-dimanche) """
    now = datetime.now()
    lundi = now - timedelta(days=now.weekday())
    dimanche = lundi + timedelta(days=6)
    evenements = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        Evenement.date_de_debut.between(lundi, dimanche)
    ).all()
    dates_semaine = [(lundi + timedelta(days=i)).strftime("%Y%m%d")
                     for i in range(7)]
    jours_semaine = [_jour_de_semaine(date) for date in dates_semaine]
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


def _filtrer_par_mois(year_month: datetime.date, include_periodiques: bool):
    """ Récupère tous les événements d'un mois donné """
    evenements = Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        db.extract('year', Evenement.date_de_debut) == year_month.year,
        db.extract('month', Evenement.date_de_debut) == year_month.month
    ).all()
    if include_periodiques:
        evenements_periodiques = Evenement.query.filter(
            Evenement.evenement_masque == False,
            Evenement.evenement_periodique == True
        ).all()
        month_string = year_month.strftime("%Y%m")
        evenements_periodiques = [
            evt for evt in evenements_periodiques
            if not any(date.startswith(month_string) for date in evt.dates_annulation)
        ]
        return evenements + evenements_periodiques
    return evenements


def _filtrer_par_annee(year_str: str):
    """ Récupère tous les événements d'une année donnée (sans événements périodiques) """
    year = int(year_str)
    return Evenement.query.filter(
        Evenement.evenement_masque == False,
        Evenement.evenement_periodique == False,
        db.extract('year', Evenement.date_de_debut) == year
    ).all()


def _jour_de_semaine(date_str):
    """ Convertit une date AAAAMMJJ en jour de la semaine (ex: 'lundi') """
    date_obj = datetime.strptime(date_str, "%Y%m%d")
    jours = ["lundi", "mardi", "mercredi",
             "jeudi", "vendredi", "samedi", "dimanche"]
    return jours[date_obj.weekday()]
