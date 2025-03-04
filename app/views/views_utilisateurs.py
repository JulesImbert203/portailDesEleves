# views_utilisateurs.py
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import current_user # necessaire pour tester l'authentification
from flask_login import login_user, logout_user # pour connecter un utilisateur
from werkzeug.security import check_password_hash

# Création du Blueprint "users"
utilisateurs_bp = Blueprint('utilisateurs', __name__)
from ..models import db, Utilisateur


# Route pour afficher la page blanche de connexion (quand on arrive sur le portail sans etre connecte)
@utilisateurs_bp.route('/page_blanche_de_connexion', methods=['GET'])
def page_blanche_de_connexion():
    return render_template('page_blanche_de_connexion.html') 


# Route pour verifier les informations de connexion
# est executee par le bouton du formulaire d'inscription
@utilisateurs_bp.route('/connexion', methods=['POST'])
def connexion():
    if current_user.is_authenticated:
        return redirect(url_for('index.accueil'))  # Si l'utilisateur est deja connecte, redirige vers l'accueil
    username = request.form.get('username')
    password = request.form.get('password')
    # Recherche l'utilisateur par son nom d'utilisateur
    utilisateur = Utilisateur.query.filter_by(nom_utilisateur=username).first()
    # Verification du mot de passe
    if utilisateur and check_password_hash(utilisateur.mot_de_passe, password):
        login_user(utilisateur)  # Connecte l'utilisateur
        return redirect(url_for('index.accueil'))  # Redirige vers la page d'accueil
    else:
        flash('Nom d\'utilisateur ou mot de passe incorrect.')  # Message d'erreur
        return redirect(url_for('utilisateurs.page_blanche_de_connexion'))  # Redirige vers la page de connexion

# se deconnecter    
@utilisateurs_bp.route('/deconnexion', methods=['POST'])
def deconnexion():
    logout_user()  # Deconnecte l'utilisateur
    return redirect(url_for('index.accueil'))