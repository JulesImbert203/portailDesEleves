from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, date

from app.services import *
from app.utils.decorators import *
from app.services.services_utilisateurs import *
from app.models.models_associations import AssociationMembre


# Creer le blueprint pour les utilisateurs
controllers_utilisateurs = Blueprint('controllers_utilisateurs', __name__)


@controllers_utilisateurs.route('/obtenir_liste_utilisateurs/<int:promo>/<string:cycles>', methods=['GET'])
@login_required
def obtenir_liste_utilisateurs(promo: int, cycles: str):
    """
    Renvoie la liste des utilisateurs par cycle et par promotion
    - cycles est une liste en string de la forme "ic,ast"
    - Ne fonctionne pas pour renvoyer la de
    """
    str_cycles = cycles.split(",")
    valid_cycles = {'ic', 'ast', 'vs', 'ev', 'isup'}
    # Vérification des cycles
    for cycle in str_cycles:
        if cycle not in valid_cycles:
            return jsonify({"message": f"Erreur : cycle invalide '{cycle}'. Valeurs autorisées: {valid_cycles}"}), 400
    # Récupération des utilisateurs avec seulement les champs nécessaires
    utilisateurs = Utilisateur.query.with_entities(
        Utilisateur.id,
        Utilisateur.nom_utilisateur,
        Utilisateur.prenom,
        Utilisateur.surnom,
        Utilisateur.nom,
        Utilisateur.promotion,
        Utilisateur.cycle
    ).filter(
        Utilisateur.promotion == str(promo),
        Utilisateur.cycle.in_(str_cycles)
    ).all()
    # Conversion en JSON
    liste_utilisateurs = [
        {
            "id": u.id,
            "nom_utilisateur": u.nom_utilisateur,
            "prenom": u.prenom,
            "surnom": u.surnom,
            "nom": u.nom,
            "promotion": u.promotion,
            "cycle": u.cycle
        }
        for u in utilisateurs
    ]
    return jsonify(liste_utilisateurs), 200


@controllers_utilisateurs.route('/obtenir_liste_des_promos', methods=["GET"])
@login_required
def obtenir_liste_des_promos():
    """Renvoie la liste des promotions au format JSON"""
    promotions = db.session.query(Utilisateur.promotion).distinct().all()
    promotions_list = [promo[0] for promo in promotions if promo[0] is not None]  # Exclure les None
    return jsonify(promotions_list)


@controllers_utilisateurs.route('/charger_utilisateurs_par_promo/<int:promo>', methods=['GET'])
@login_required
def charger_utilisateurs_par_promo(promo: int):
    """
    Charge la liste des utilisateurs d'une promo donnée pour Soifguard
    """
    utilisateurs = Utilisateur.query.filter_by(promotion=promo).all()
    if not utilisateurs:
        return jsonify({"message": "Aucun utilisateur trouvé pour cette promo"}), 404
    liste_utilisateurs = [
        {
            "id": utilisateur.id,
            "nom_utilisateur": utilisateur.nom_utilisateur,
            "prenom": utilisateur.prenom,
            "nom": utilisateur.nom,
            "promotion": utilisateur.promotion,
            "solde_octo": utilisateur.solde_octo,
            "solde_biero": utilisateur.solde_biero,
            "est_cotisant_biero": utilisateur.est_cotisant_biero,
            "est_cotisant_octo": utilisateur.est_cotisant_octo
        }
        for utilisateur in utilisateurs
    ]
    return jsonify(liste_utilisateurs), 200


# routes API :
# /!\ NON securisé. Doit être utilisé pour de l'affichage uniquement,
# chaque route sensible doit avoir le decorateur @superutilisateur_required
@controllers_utilisateurs.route("/verifier_superutilisateur", methods=["GET"])
@login_required
def verifier_superutilisateur():
    """
    Vérifie si l'utilisateur connecté est un superutilisateur.
    Retourne { "is_superuser": True } si oui, sinon { "is_superuser": False }.
    """
    return jsonify({"is_superuser": current_user.est_superutilisateur})


@controllers_utilisateurs.route("/obtenir_id_par_nomutilisateur/<string:nom_utilisateur>", methods=["GET"])
@login_required
def obtenir_id_par_nomutilisateur(nom_utilisateur: str):
    """
    Récupère l'ID d'un utilisateur à partir de son nom d'utilisateur.
    """
    utilisateur = Utilisateur.query.filter_by(nom_utilisateur=nom_utilisateur).first()
    if utilisateur:
        return jsonify({"success": True, "id_utilisateur": utilisateur.id}), 200
    else:
        return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404


@controllers_utilisateurs.route('/obtenir_infos_profil/<int:user_id>', methods=['GET'])
@login_required
def obtenir_infos_profil(user_id: int):
    """
    Fournit les informations affichees sur le profil d'un utilisateur
    """
    utilisateur = get_utilisateur(user_id)
    if not utilisateur:
        return jsonify({"message": "Utilisateur non trouvé"}), 404
    else:
        infos_utilisateur = {
            "id": utilisateur.id,
            "nom_utilisateur": utilisateur.nom_utilisateur,
            "prenom": utilisateur.prenom,
            "nom": utilisateur.nom,
            "surnom": utilisateur.surnom,
            "promotion": utilisateur.promotion,
            "chambre": utilisateur.chambre,
            "cycle": utilisateur.cycle,
            "email": utilisateur.email,
            "telephone": utilisateur.telephone,
            "date_de_naissance": utilisateur.date_de_naissance,
            "ville_origine": utilisateur.ville_origine,
            "sports": utilisateur.sports,
            "instruments": utilisateur.instruments,
            "marrain": {"id": utilisateur.marrain.id, "nom_utilisateur": utilisateur.marrain.nom_utilisateur} if utilisateur.marrain else None,
            "co": {"id": utilisateur.co.id, "nom_utilisateur": utilisateur.co.nom_utilisateur} if utilisateur.co else None,
            "fillots": [{"id": fillot.id, "nom_utilisateur": fillot.nom_utilisateur} for fillot in utilisateur.fillots],
            "vote_sondaj_du_jour": utilisateur.vote_sondaj_du_jour,
            "is_superuser": utilisateur.est_superutilisateur
        }
        return jsonify(infos_utilisateur), 200


@controllers_utilisateurs.route('/assos_utilisateur/<int:user_id>', methods=['GET', 'POST'])
@login_required
def assos_utilisateur(user_id: int):
    """
    Renvoie les assos de l'utilisateur, avec leurs noms et le rôle dans l'asso
    """
    utilisateur = get_utilisateur(user_id)
    if not utilisateur:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    roles_actuels = AssociationMembre.query.filter_by(utilisateur_id=user_id).all()
    roles_anciens = AssociationAncienMembre.query.filter_by(utilisateur_id=user_id).all()

    data = {
        "associations_actuelles": [
            {"role": role.role, "nom": role.association.nom, "asso_id": role.association_id} for role in roles_actuels
        ],
        "associations_anciennes": [
            {"role": role.role, "nom": role.association.nom, "asso_id": role.association_id} for role in roles_anciens
        ]
    }
    return jsonify(data)


@controllers_utilisateurs.route('/questions_reponses/<int:user_id>', methods=['GET', 'POST'])
@login_required
def questions_reponses(user_id: int):
    """
    Renvoie ou modifie les réponses au questions du portail
    """
    utilisateur = get_utilisateur(user_id)
    if not utilisateur:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    if request.method == 'GET':
        return jsonify(utilisateur.questions_reponses_du_portail), 200

    elif request.method == 'POST':
        if not (user_id == current_user.id or current_user.est_superutilisateur):
            return jsonify({"message": "Pas le droit"}), 401

        data = request.get_json()
        if not valider_questions_du_portail(data):
            return jsonify({"message": "Reponses mal formées"}), 400
        utilisateur.questions_reponses_du_portail = data
        db.session.add(utilisateur)
        db.session.commit()
        return jsonify({"message": "Reponses patchées"}), 200


@controllers_utilisateurs.route('/infos/<int:user_id>', methods=['POST'])
@login_required
def set_user_infos(user_id: int):
    """
    Renvoie ou modifie les réponses au questions du portail
    """
    utilisateur = get_utilisateur(user_id)
    if not utilisateur:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    if not (user_id == current_user.id or current_user.est_superutilisateur):
        return jsonify({"message": "Pas le droit"}), 401

    data = request.get_json()
    # if not valider_questions_du_portail (data):
    #     return jsonify({"message": "Reponses mal formées"}), 400

    # utilisateur.date_de_naissance = date.fromisoformat(data[1][1])
    utilisateur.ville_origine = data["ville_origine"]
    utilisateur.chambre = data["chambre"]
    utilisateur.instruments = data["instruments"]

    db.session.add(utilisateur)
    db.session.commit()
    return jsonify({"message": "Reponses patchées"}), 200


@controllers_utilisateurs.route('/supprimer_co', methods=['POST'])
@login_required
def route_supprimer_co():
    """
    Supprime le lien de co de l'utilisateur connecte et de son co
    """
    utilisateur = current_user
    co = get_utilisateur(current_user.co_id)
    if not co:
        return jsonify({"message": "Co non trouvé"}), 404
    try:
        supprimer_co(utilisateur, co)
        return jsonify({"message": "Lien de co supprime avec succes"}), 200
    except Exception as e:
        return jsonify({"message": f"Erreur lors de la suppression du lien de co : {str(e)}"}), 500


@controllers_utilisateurs.route('/creer_co/<int:new_co_id>', methods=["POST"])
@login_required
def route_creer_co(new_co_id: int):
    """
    Cree un lien de colocation entre deux utilisateurs en modifiant leurs attributs.
    Si l'un des deux utilisateurs avait deja un co, le lien precedent est detruit. 
    """
    co = get_utilisateur(new_co_id)
    if not co:
        return jsonify({"message": "Utilisateur Co non trouve"}), 404
    try:
        creer_co(current_user, co)
        return jsonify({"message": "Lien de co cree avec succes"}), 200
    except Exception as e:
        return jsonify({"message": f"Erreur lors de la creation du lien de co : {str(e)}"}), 500

# Ajouter un decorateur qui verifie si on a le droit de modifier sa genealogie (variable globale mise a True pendant le parrainnage)


@controllers_utilisateurs.route('/select_fillots', methods=["POST"])
@login_required
def route_selectionner_fillots():
    """
    Ajoute une liste de fillots a la famille.
    La liste des IDs de fillots est fournie dans le corps de la requête en JSON.
    Exemple: {"fillots_ids": [12, 45, 78]}
    """
    data = request.get_json()
    if not data or 'fillots_ids' not in data:
        return jsonify({"message": "Liste d'IDs de fillots non fournie"}), 400

    fillots_id_list = data['fillots_ids']

    if not isinstance(fillots_id_list, list) or not all(isinstance(i, int) for i in fillots_id_list):
        return jsonify({"message": "La liste d'IDs de fillots est invalide"}), 400

    fillots_list = [get_utilisateur(id_fillot) for id_fillot in fillots_id_list]

    if None in fillots_list:
        return jsonify({"message": "Un ou plusieurs IDs de fillots sont invalides"}), 404

    try:
        ajouter_fillots_a_la_famille(current_user, fillots_list)
        return jsonify({"message": "Fillots ajoutes avec succes"}), 200
    except Exception as e:
        return jsonify({"message": f"Erreur lors de l'ajout des fillots : {str(e)}"}), 500
# Ajouter un decorateur qui verifie si on a le droit de modifier sa genealogie (variable globale mise a True pendant le parrainnage)


@controllers_utilisateurs.route('/supprimer_fillots', methods=['DELETE'])
@login_required
def route_supprimer_fillots():
    """
    Supprime ses fillots. Ne renvoie pas d'erreur si l'utilisateur n'a pas de fillot. 
    Supprime donc en consequence le marrain des fillots concernes
    Verifie avant de modifier le fillot que le lien etait bien comme il devait etre
    Cette fonction ne doit etre utilisee qu'en cas d'erreur lors de l'attribution des fillots
    """
    try:
        supprimer_fillots(current_user)
        return jsonify({"message": "Fillot(s) supprime(s) avec succes"}), 200
    except Exception as e:
        return jsonify({"message": f"Erreur lors de la suppression des fillots : {str(e)}"}), 500


# Ajouter un decorateur qui verifie si on a le droit de modifier sa genealogie (variable globale mise a True pendant le parrainnage)
@controllers_utilisateurs.route('/prochains_anniv', methods=['GET'])
@login_required
def route_get_anniv():
    """
    Renvoie la liste des prochains anniversaires
    """
    try:
        ret = prochains_anniv()
        return jsonify(ret), 200
    except Exception as e:
        return jsonify({"message": f"Erreur lors de l'obtention de la liste d'anniversaires' : {str(e)}"}), 500

@controllers_utilisateurs.route('/changer_marrain', methods=["POST"])
@login_required
def route_changer_marrain():
    """
    Change le marrain d'un fillot.
    Prend un JSON avec "marrain_id" and "fillot_id".
    """
    data = request.get_json()
    if not data or 'marrain_id' not in data or 'fillot_id' not in data:
        return jsonify({"message": "marrain_id et fillot_id requis"}), 400

    marrain_id = data['marrain_id']
    fillot_id = data['fillot_id']

    marrain = db.session.get(Utilisateur, marrain_id)
    fillot = db.session.get(Utilisateur, fillot_id)

    if not marrain or not fillot:
        return jsonify({"message": "Marrain ou fillot non trouvé"}), 404

    # For now, let's assume only a superuser can.
    if not current_user.est_superutilisateur:
        return jsonify({"message": "Action non autorisée"}), 403

    try:
        changer_marrain(marrain, fillot)
        return jsonify({"message": "Marrain changé avec succès"}), 200
    except Exception as e:
        return jsonify({"message": f"Erreur lors du changement de marrain : {str(e)}"}), 500
