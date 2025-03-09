# views_index.py
"""
Ce fichier contient les routes pour la page d'accueil
"""

from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import current_user # necessaire pour tester l'authentification
from ..utils.decorators import vp_sondaj_required


index_bp = Blueprint('index', __name__)

# Route d'accueil
@index_bp.route('/')
def accueil():
    if current_user.is_authenticated : 
        return render_template('index.html')
    else :
        return redirect(url_for('utilisateurs.page_blanche_de_connexion')) # utilisateurs. car "utilisateurs" est le nom du blueprint index

