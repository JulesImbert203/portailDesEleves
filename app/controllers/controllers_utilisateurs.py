from flask import Blueprint
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *


# Creer le blueprint pour les utilisateurs
controllers_utilisateurs = Blueprint('controllers_utilisateurs', __name__)


# routes API :

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
            "assos_actuelles": utilisateur.assos_actuelles,
            "anciennes_assos": utilisateur.anciennes_assos,
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
