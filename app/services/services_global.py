# importer les models grace a __init__.py de models
from app.services import db
from app.models import GlobalVariable

"""
Les variables globales du projet 
"""

def get_global_var(key):
    var = GlobalVariable.query.filter_by(key=key).first()
    if var :
        return var.value
    else :
        raise KeyError(f"Pas de variable globale de nom {key}")


def set_global_var(key, value):
    var = GlobalVariable.query.filter_by(key=key).first()
    if var:
        var.value = value
    else:
        raise KeyError(f"Pas de variable globale de nom {key}")
   