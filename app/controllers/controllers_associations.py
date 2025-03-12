from flask import Blueprint
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *
from app.services.services_associations import *

import request
import json


# Creer le blueprint pour les utilisateurs
controllers_associations = Blueprint('controllers_associations', __name__)

# routes API :

@controllers_associations.route('/assocations/<int:association_id>/ajouter_membre/<int:nouveau_membre_id>', methods=['POST'])
def route_ajouter_membre(association_id, nouveau_membre_id):
    """
    Ajoute un membre a l'association
    """
    @est_membre_de_asso(association_id)
    def ajouter_membre():
        association=get_association(association_id)

        if not association:
            return jsonify({"message": "Association non trouvee"}), 404
        
        nouveau_membre = get_utilisateur(nouveau_membre_id)
        if not nouveau_membre:
            return jsonify({"message": "Utilisateur non trouve"}), 404
        
        try:
            add_member(association, nouveau_membre, "membre")  
            return jsonify({"message": "Membre ajoute avec succes"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Erreur lors de l'ajout du membre : {str(e)}"}), 500
        
    return ajouter_membre()

@controllers_associations.route('/assocations/<int:association_id>/retirer_membre/<int:membre_id>', methods=['POST'])
def route_retirer_membre(association_id, membre_id):
    """
    Retire un membre de l'association"
    """

    @est_membre_de_asso(association_id)
    def retirer_membre():
        association=get_association(association_id)

        if not association:
            return jsonify({"message": "Association non trouvee"}), 404
        
        membre = get_utilisateur(membre_id)
        if not membre:
            return jsonify({"message": "Utilisateur non trouve"}), 404
        
        try:
            remove_member(association, membre)  
            return jsonify({"message": "Membre retire avec succes"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Erreur lors du retrait du membre : {str(e)}"}), 500
        
    return retirer_membre()

@controllers_associations.route('/assocations/<int:association_id>/modifier_role_membre/<int:membre_id>', methods=['POST'])
def route_modifier_role_membre(association_id, membre_id):
    """
    Modifie le role d'un membre de l'association
    """
    @est_membre_de_asso(association_id)
    def modifier_role_membre():
        association=get_association(association_id)

        if not association:
            return jsonify({"message": "Association non trouvee"}), 404
        
        membre = get_utilisateur(membre_id)
        if not membre:
            return jsonify({"message": "Utilisateur non trouve"}), 404
        
        try:
            role = request.json.get('role')
            update_member_role(association, membre, role)  
            return jsonify({"message": "Role du membre modifie avec succes"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Erreur lors de la modification du role du membre : {str(e)}"}), 500
        
    return modifier_role_membre()

@controllers_associations.route(('/assocations/<int:association_id>/update_members_order'), methods=['POST'])
def route_modifier_ordre_membres(association_id):
    """
    Modifie l'ordre des membres de l'association
    """
    @est_membre_de_asso(association_id)
    def modifier_ordre_membres():
        association=get_association(association_id)

        if not association:
            return jsonify({"message": "Association non trouvee"}), 404
        
        try:
            members_weights = request.json.get('members_weights')
            update_members_order(association, members_weights)  
            return jsonify({"message": "Ordre des membres modifie avec succes"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Erreur lors de la modification de l'ordre des membres : {str(e)}"}), 500
        
    return modifier_ordre_membres()