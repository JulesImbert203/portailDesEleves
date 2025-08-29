from flask import Blueprint, request, jsonify
from flask_login import login_required

from app.services import *
from app.utils.decorators import *
from app.services.services_publications import *

controllers_publications = Blueprint('controllers_publications', __name__)