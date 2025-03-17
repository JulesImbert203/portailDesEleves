from app import create_app, db
from app.models import Utilisateur,Association
from app.services.services_associations import *
from app.services.services_utilisateurs import *
from sqlalchemy.orm.attributes import flag_modified


app = create_app()

with app.app_context():
 
    print(db.session.get(Association, 1))
