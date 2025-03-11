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

   

