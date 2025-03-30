from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *
from app.services.services_associations import *
from app.models import *


import requests
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
            role = requests.json.get('role')
            update_member_role(association, membre, role)  
            return jsonify({"message": "Role du membre modifie avec succes"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Erreur lors de la modification du role du membre : {str(e)}"}), 500
        
    return modifier_role_membre()

@controllers_associations.route(('/associations/<int:association_id>/update_members_order'), methods=['POST'])
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
            members_weights = requests.json.get('members_weights')
            update_members_order(association, members_weights)  
            return jsonify({"message": "Ordre des membres modifie avec succes"}), 200
        
        except Exception as e:
            return jsonify({"message": f"Erreur lors de la modification de l'ordre des membres : {str(e)}"}), 500
        
    return modifier_ordre_membres()


@controllers_associations.route('/<int:association_id>/add_content', methods = ['POST'])
def route_add_content(association_id):
    """
        Ajoute du contenu au dossier de l'asso
    """
    #@est_membre_de_asso(association_id)  #PENSER A L'ACTIVER QUAND POSSIBLE
    def add_content(*args): #args sert à dump les arguments inutiles reçus lors de la requete 
        
        asso = get_association(association_id)
        UPLOAD_FOLDER = 'app/upload/associations/' + asso.nom_dossier + '/'
        ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'} #extensions autorisées pour l'upload de document
        if 'file' not in request.files:
            print("DEBUG: request.files =", request.files)
            return str(request.files), 400

        file = request.files['file']
        if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            return render_template('asso.html')
        return 'Error', 400
    return add_content()  

@controllers_associations.route('/assos', methods = ['GET'])  
def get_assos():
    assos = Association.query.all()
    return jsonify([{"id": asso.id, "nom": asso.nom, "nom_dossier" : asso.nom_dossier,"img" :asso.logo_path, "ordre" : asso.ordre_importance} for asso in assos])

@controllers_associations.route('/<int:association_id>', methods = ['GET'])  
def get_asso(association_id):
    asso = Association.query.filter_by(id=association_id).first()
    print(asso.logo_path)
    return jsonify({"id": asso.id, "nom_dossier": asso.nom_dossier,"nom": asso.nom, "img" :asso.logo_path, "ordre" : asso.ordre_importance, "banniere_path": asso.banniere_path})
    
@controllers_associations.route("route_est_membre_de_asso/<int:id_association>", methods=["GET"])
@login_required
def route_est_membre_de_asso(id_association:int):
    try : 
        is_membre = id_association in current_user.assos_actuelles.keys()
        autorise = is_membre or current_user.est_superutilisateur
        return jsonify({"is_membre" : is_membre, "autorise" : autorise}), 200
    except Exception as e:
        return jsonify({f"Erreur : {e}"}), 400