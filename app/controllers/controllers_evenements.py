from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import *
from app.services.services_utilisateurs import *
from app.services.services_associations import *
from app.services.services_evenements import *

# Creer le blueprint pour les evenements
controllers_evenements = Blueprint('controllers_evenements', __name__)


@controllers_evenements.route("<int:association_id>/creer_nouvel_evenement", methods=['POST'])
@login_required
@est_membre_de_asso
def route_creer_nouvel_evenement(association_id: int):
    """
    Ajoute un nouvel evenement dans la BDD. 
    La logique de si l'evenement est periodique ou non est laisse a init du model Evenement
    Les tags doivent etre tous presents dans la data, meme si None
    """
    try:
        data = request.json
        check = verifier_format(data)
        if check["valide"]:
            if data["evenement_periodique"]:
                evenement = Evenement(id_association=association_id,
                                      nom=data["nom"],
                                      description=data["description"],
                                      lieu=data["lieu"],
                                      evenement_periodique=data["evenement_periodique"],
                                      jours_de_la_semaine=data["jours_de_la_semaine"],
                                      heure_de_debut=time.fromisoformat(data["heure_de_debut"]),
                                      heure_de_fin=time.fromisoformat(data["heure_de_fin"]))
            else:
                evenement = Evenement(id_association=association_id,
                                      nom=data["nom"],
                                      description=data["description"],
                                      lieu=data["lieu"],
                                      evenement_periodique=data["evenement_periodique"],
                                      date_de_debut=datetime.fromisoformat(data["date_de_debut"]),
                                      date_de_fin=datetime.fromisoformat(data["date_de_fin"]))
            db.session.add(evenement)
            db.session.commit()
            return jsonify({"message": "Événement créé avec succès", "id_evenement": evenement.id}), 201
        else:
            return jsonify({"message": check["message"]}), 400
    except Exception as e:
        return jsonify({"message": f"erreur lors de la création de l'événement : {e}"}), 500


@controllers_evenements.route("<int:association_id>/modifier_evenement/<int:id_evenement>", methods=['PUT'])
@login_required
@est_membre_de_asso
def route_modifier_evenement(id_evenement: int):
    """
    Modifie un événement existant dans la BDD.
    """
    try:
        evenement = Evenement.query.get(id_evenement)
        if not evenement:
            return jsonify({"message": "Événement non trouvé"}), 404
        data = request.json
        check = verifier_format(data)
        if check["valide"]:
            evenement.nom = data["nom"]
            evenement.description = data["description"]
            evenement.lieu = data["lieu"]
            evenement.evenement_periodique = data["evenement_periodique"]
            if evenement.evenement_periodique:
                evenement.jours_de_la_semaine = data["jours_de_la_semaine"]
                evenement.heure_de_debut = data["heure_de_debut"]
                evenement.heure_de_fin = data["heure_de_fin"]
            else:
                evenement.date_de_debut = data["date_de_debut"]
                evenement.date_de_fin = data["date_de_fin"]
            db.session.commit()
            return jsonify({"message": "Événement modifié avec succès"}), 200
        else:
            return jsonify({"message": check["message"]}), 400

    except Exception as e:
        return jsonify({"message": f"Erreur lors de la modification de l'événement : {e}"}), 500


@controllers_evenements.route("<int:association_id>/toggle_visibility/<int:evenement_id>", methods=["POST"])
@login_required
@est_membre_de_asso
def route_toggle_visibility(evenement_id):
    evenement = Evenement.query.get(evenement_id)
    if not evenement:
        return jsonify({"message": "Événement non trouvé"}), 404
    change_event_visibility(evenement)
    return jsonify({"message": "Visibilité de l'événement modifiée", "evenement_masque": evenement.evenement_masque}), 200


@controllers_evenements.route("<int:association_id>/supprimer_evenement/<int:evenement_id>", methods=["DELETE"])
@login_required
@est_membre_de_asso
def route_supprimer_evenement(evenement_id):
    evenement = Evenement.query.get(evenement_id)
    if not evenement:
        return jsonify({"message": "Événement non trouvé"}), 404
    supprimer_evenement(evenement)
    return jsonify({"message": "Événement supprimé avec succès"}), 200


@controllers_evenements.route("<int:association_id>/annuler_evenement/<int:evenement_id>", methods=["POST"])
@login_required
@est_membre_de_asso
def route_annuler_evenement(evenement_id):
    data = request.json
    date = data.get("date")
    evenement = Evenement.query.get(evenement_id)
    if not evenement:
        return jsonify({"message": "Événement non trouvé"}), 404
    if not evenement.evenement_periodique:
        return jsonify({"message": "Seuls les événements périodiques peuvent être annulés sur une date spécifique"}), 400
    if not est_date_AAAAMMJJ(date):
        return jsonify({"message": "La date doit être au format AAAAMMJJ"}), 400
    evenement.dates_annulation.append(date)
    db.session.commit()


@controllers_evenements.route("obtenir_evenements/<string:date>")
@login_required
def route_obtenir_evenements(date: str):
    """
    Récupère les evenements en fonction d'une date fournie.
    - "ajd" : evenements du jour
    - "week" : evenements de la semaine en cours (du lundi au dimanche)
    - "AAAAMMJJ" : evenements du jour spécifie
    - "AAAAMM" : evenements du mois spécifie
    - "AAAA" : evenements de l'annee spécifiee (sans evenements periodiques)
    Renvoie une liste d'objets Evenement
    Si aucun evenement n'est trouve, renvoie une liste vide
    """
    try:
        evenements = get_evenements_par_date(date)
        return jsonify({"evenements": [e.to_dict() for e in evenements]}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@controllers_evenements.route("obtenir_evenements_asso/<int:id_asso>")
@login_required
def route_obtenir_evenements_asso(id_asso: int):
    try:
        evenements = Evenement.query.filter(
            Evenement.id_association == id_asso).all()
        return jsonify({"evenements": [e.to_dict() for e in evenements]}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
