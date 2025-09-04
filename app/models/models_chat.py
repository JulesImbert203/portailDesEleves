from app import db
from datetime import datetime
from flask import jsonify

from app.models.models_utilisateurs import Utilisateur

class Message(db.Model):
    __tablename__ = 'messages'
    # ID de l'association
    id = db.Column(db.Integer, primary_key=True)

    # Éléments ajoutés à la création de l'association — Modifiables par les membres de l'association
    text = db.Column(db.String(1000), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    utilisateur = db.Column(db.Integer, db.ForeignKey("utilisateurs.id"))


    def __init__(
        self, text: str, author: int, date: datetime
    ):
        """
        Crée une nouvelle association
        """
        self.text = text
        self.utilisateur = author
        self.date = date

    def __repr__(self):
        """
        Methode optionnelle, mais utile pour deboguer et afficher l'association.
        """
        return f"<Association {self.nom}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def to_dict(self, asker_id: int):
        author = Utilisateur.query.filter_by(id=self.utilisateur).first()
        return {
            "text": self.text,
            "time": self.date.strftime ("%H:%M"),
            "author": author.nom_utilisateur,
            "is_you": asker_id==self.utilisateur,
            "id": self.id
        }
