# decorators.py
# Contient les decorateurs personnalises pour s'assurer que les permissions sont respectees

from functools import wraps
from flask import redirect, url_for, flash, jsonify
from flask_login import current_user
from app.models import *

def vp_sondaj_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verifie si l'utilisateur est connecte et a le tag "est_vp_sondage" a True
        if not current_user.is_authenticated or not current_user.est_vp_sondaj:
            flash("Vous devez etre un VP_sondage pour effectuer cette action", "warning")
            return redirect(url_for('index'))  # Redirige vers la page d'accueil ou autre page
        return f(*args, **kwargs)
    return decorated_function

def superutilisateur_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verifie si l'utilisateur est connecte et a le tag "est_superutilisateur" a True
        if not current_user.is_authenticated or not current_user.est_superutilisateur:
            flash("Vous devez etre un superutilisateur pour effectuer cette action", "warning")
            return redirect(url_for('index'))  # Redirige vers la page d'accueil ou autre page
        return f(*args, **kwargs)
    return decorated_function

def est_membre_de_asso(association_id):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Vérifie si l'utilisateur est connecté et si l'élément est dans current_user.elements
            if not current_user.is_authenticated or association_id not in current_user.assos_actuelles.keys()  or not current_user.est_superutilisateur:
                flash("Vous n'avez pas les permissions pour effectuer cette action", "warning")
                return redirect(url_for('index'))  # Redirige vers la page d'accueil ou autre page
            return f(*args, **kwargs)
        return decorated_function
    return decorator  

def a_permission_soifguard_octo(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        permission = PermissionSoifguard.query.filter_by(id_utilisateur=current_user.id, asso='octo').first()
        if not permission:
            return jsonify({"success": False, "message": "Accès refusé : permission Octo requise"}), 403
        return f(*args, **kwargs)
    return decorated_function

def a_permission_soifguard_biero(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        permission = PermissionSoifguard.query.filter_by(id_utilisateur=current_user.id, asso='biero').first()
        if not permission:
            return jsonify({"success": False, "message": "Accès refusé : permission Biero requise"}), 403
        return f(*args, **kwargs)
    return decorated_function