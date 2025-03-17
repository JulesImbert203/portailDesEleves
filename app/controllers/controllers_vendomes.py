from flask import Blueprint
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *


# Creer le blueprint pour les utilisateurs
controllers_vendomes = Blueprint('controllers_vendomes', __name__)

UPLOAD_VENDOMES_FOLDER = 'uploads/vendomes'
controllers_vendomes.config['UPLOAD_VENDOMES_FOLDER'] = UPLOAD_VENDOMES_FOLDER