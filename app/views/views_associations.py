# views_associations.py
from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import current_user # necessaire pour tester l'authentification

# Création du Blueprint "associations"
associations_bp = Blueprint('associations', __name__)