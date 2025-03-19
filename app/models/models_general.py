from app import db

class GlobalVariable(db.Model):
    """
    Variables globales : id|"nom_variable"|"valeur_variable
    """
    __tablename__ = 'global'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.String(255), nullable=True)

