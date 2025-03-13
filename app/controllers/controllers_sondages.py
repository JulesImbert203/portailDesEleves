from flask import Blueprint
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 


# Creer le blueprint pour les utilisateurs
controllers_sondages = Blueprint('controllers_sondages', __name__)

