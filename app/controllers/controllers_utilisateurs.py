from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *


# Creer le blueprint pour les utilisateurs
controllers_utilisateurs = Blueprint('controllers_utilisateurs', __name__)

@controllers_utilisateurs.route('/obtenir_liste_utilisateurs/<int:promo>/<string:cycles>', methods=['GET'])
@login_required
def obtenir_liste_utilisateurs(promo:int, cycles:str):
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
        Utilisateur.nom_de_famille, 
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
            "nom_de_famille": u.nom_de_famille,
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
            "nom_de_famille": utilisateur.nom_de_famille,
            "promotion": utilisateur.promotion,
            "solde_octo": utilisateur.solde_octo,
            "solde_biero": utilisateur.solde_biero,
            "est_cotisant_biero": utilisateur.est_cotisant_biero,
            "est_cotisant_octo":utilisateur.est_cotisant_octo
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
def obtenir_id_par_nomutilisateur(nom_utilisateur:str):
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
def obtenir_infos_profil(user_id:int) :
    """
    Fournit les informations affichees sur le profil d'un utilisateur
    """
    utilisateur = get_utilisateur(user_id)
    if not utilisateur :
        return jsonify({"message": "Utilisateur non trouvé"}), 404
    else :
        infos_utilisateur = {
            "id": utilisateur.id,
            "nom_utilisateur": utilisateur.nom_utilisateur,
            "prenom": utilisateur.prenom,
            "nom_de_famille": utilisateur.nom_de_famille,
            "surnom": utilisateur.surnom,
            "promotion": utilisateur.promotion,
            "cycle": utilisateur.cycle,
            "email": utilisateur.email,
            "telephone": utilisateur.telephone,
            "date_de_naissance": utilisateur.date_de_naissance,
            "ville_origine": utilisateur.ville_origine,
            "sports": utilisateur.sports,
            "instruments": utilisateur.instruments,
            "marrain_id": utilisateur.marrain_id,
            "marrain_nom": utilisateur.marrain_nom,
            "co_id": utilisateur.co_id,
            "co_nom": utilisateur.co_nom,
            "fillots_dict": utilisateur.fillots_dict,
            "questions_reponse_du_portail": utilisateur.questions_reponses_du_portail,
            "associations_actuelles": [asso.association.nom for asso in utilisateur.associations_actuelles],
            "asociations_anciennes": [asso.association.nom for asso in utilisateur.associations_anciennes],
            "vote_sondaj_du_jour" : utilisateur.vote_sondaj_du_jour,
        }
        return jsonify(infos_utilisateur), 200


@controllers_utilisateurs.route('/supprimer_co', methods=['POST'])
@login_required
def route_supprimer_co() :
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
def route_creer_co(new_co_id:int) :
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
@controllers_utilisateurs.route('/select_fillots/<string:fillots_id_list>', methods=["POST"])
@login_required
def route_selectionner_fillots(fillots_id_list) :
    """
    Ajoute une liste de fillots a la famille. Si des fillots existent deja, une erreur est levee.
    Si l'un des fillots possede deja un marrain, une erreur est levee. 
    Ne devra etre utilisee qu'une fois, au moment d'ajouter ses fillots au parrainnage. 
    - fillots au format "12,45,78"
    """
    # Convertir la chaîne de caractères (les IDs) en une liste d'entiers
    try:
        fillots_id_list = list(map(int, fillots_id_list.split(',')))
        fillots_list = [get_utilisateur(id_fillot) for id_fillot in fillots_id_list]
    except ValueError:
        return jsonify({"message": "Liste d'IDs invalide"}), 400
    try :
        ajouter_fillots_a_la_famille(current_user, fillots_list)
        return jsonify({"message": "Fillots ajoutes avec succes"}), 200  
    except Exception as e:
        return jsonify({"message": f"Erreur lors de l'ajout de fillots' : {str(e)}"}), 500

# Ajouter un decorateur qui verifie si on a le droit de modifier sa genealogie (variable globale mise a True pendant le parrainnage)
@controllers_utilisateurs.route('/supprimer_fillots', methods=['POST'])
@login_required
def route_supprimer_fillots() :
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
