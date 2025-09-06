# decorators.py
# Contient les decorateurs personnalises pour s'assurer que les permissions sont respectees

from functools import wraps
from flask import jsonify, request
from flask_login import current_user
from app.models import *

# a utiliser en plus de @login_required, on ne verifie pas ici l'authentification
# le superutilisateur a tous les droits

def vp_sondaj_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.est_vp_sondaj or current_user.est_superutilisateur:
            return f(*args, **kwargs)
        else :
            return jsonify({"message": "Vous devez etre un VP_sondage pour effectuer cette action"}), 403 
    return decorated_function

def superutilisateur_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.est_superutilisateur:
            return f(*args, **kwargs)
        else :
            return jsonify({"message": "Vous devez etre un superutilisateur pour effectuer cette action"}), 403
    return decorated_function

def est_membre_de_asso(f):
    """
    l'id de l'asso doit apparaitre dans l'URL sous le nom <association_id>"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        association_id = kwargs.get("association_id")
        if not association_id:
            return jsonify({"message": "l'URL doit contenir l'id de l'association."}), 400      
        if current_user.est_superutilisateur or (association_id in current_user.associations_actuelles.keys()):
            return f(*args, **kwargs)
        return jsonify({"message": "Vous n'avez pas les permissions pour effectuer cette action"}), 403
    return decorated_function

def a_permission_soifguard_octo(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        permission = PermissionSoifguard.query.filter_by(id_utilisateur=current_user.id, asso='octo').first()
        if permission or current_user.est_superutilisateur:
            return f(*args, **kwargs)
        else :
            return jsonify({"success": False, "message": "Accès refusé : permission Octo requise"}), 403
    return decorated_function

def a_permission_soifguard_biero(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        permission = PermissionSoifguard.query.filter_by(id_utilisateur=current_user.id, asso='biero').first()
        if permission or current_user.est_superutilisateur:
            return f(*args, **kwargs)
        else :
            return jsonify({"success": False, "message": "Accès refusé : permission Biero requise"}), 403
    return decorated_function