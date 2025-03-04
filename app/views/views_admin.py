# views_admin.py
from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import current_user # necessaire pour tester l'authentification

# Création du Blueprint "admin"
admin_bp = Blueprint('admin', __name__)