from flask import Blueprint
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *


# Creer le blueprint pour les utilisateurs
controllers_utilisateurs = Blueprint('controllers_utilisateurs', __name__)


# routes API :


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
