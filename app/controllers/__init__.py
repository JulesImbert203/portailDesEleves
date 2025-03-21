from flask import Blueprint

# Importer tous les blueprints des differents controllers
from app.controllers.controllers_utilisateurs import controllers_utilisateurs
from app.controllers.controllers_sondages import controllers_sondages
from app.controllers.controllers_associations import controllers_associations
from app.controllers.controllers_global import controllers_global
from app.controllers.controllers_soifguard import controllers_soifguard

# Creer un blueprint global qui regroupe tous les autres
api = Blueprint('api', __name__)

# Enregistrer chaque blueprint sous le blueprint global
api.register_blueprint(controllers_utilisateurs, url_prefix='/users')
api.register_blueprint(controllers_sondages, url_prefix='/sondages')
api.register_blueprint(controllers_associations, url_prefix='/associations')
api.register_blueprint(controllers_global, url_prefix='/global')
api.register_blueprint(controllers_soifguard, url_prefix='/soifguard')

# Ainsi, toutes les routes seront accessibles sous `/api/users` et `/api/sondages`, etc.
