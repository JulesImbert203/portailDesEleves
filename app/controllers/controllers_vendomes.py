from flask import Blueprint
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *


# Creer le blueprint pour les utilisateurs
controllers_utilisateurs = Blueprint('controllers_vendomes', __name__)