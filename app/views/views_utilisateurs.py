# views_utilisateurs.py
from flask import Blueprint, request, jsonify
from flask_login import current_user # necessaire pour tester l'authentification
from flask_login import login_user, logout_user, login_required
from werkzeug.security import check_password_hash

# Création du Blueprint "users"
utilisateurs_bp = Blueprint('utilisateurs', __name__)
from ..models import db, Utilisateur

@utilisateurs_bp.route('/est_auth', methods=['GET'])
def est_auth():
    """
    Renvoie True si l'utilisateur est connecte, False sinon
    """
    if current_user.is_authenticated : 
        return jsonify({"etat_connexion": True}), 200
    else :
        return jsonify({"etat_connexion": False}), 200


@utilisateurs_bp.route('/current_user_id', methods=['GET'])
@login_required
def current_user_id():
    """
    Renvoie l'id de l'utilisateur connecte, une erreur 405 s'il n'est pas connecte
    """
    if current_user.is_authenticated : 
        return jsonify({"id_utilisateur": current_user.id}), 200
    else :
        return jsonify({"id_utilisateur": None}), 405
   


# route pour se connecter, executee par React
@utilisateurs_bp.route('/connexion', methods=['POST'])
def connexion():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    # Recherche l'utilisateur par son nom d'utilisateur
    utilisateur = Utilisateur.query.filter_by(nom_utilisateur=username).first()
    # Verification du mot de passe
    if utilisateur and check_password_hash(utilisateur.mot_de_passe, password):
        login_user(utilisateur)  # Connecte l'utilisateur
        return jsonify({"connecte":True}), 200
    else :
        return jsonify({"connecte":False}), 401
        

# se deconnecter    
@utilisateurs_bp.route('/deconnexion', methods=['POST'])
@login_required
def deconnexion():
    logout_user()
    if current_user.is_authenticated :
        return jsonify({'connecte':True}),500
    else :
        return jsonify({'connecte':False}),200