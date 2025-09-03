from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import *
from app.services.services_publications import *

controllers_publications = Blueprint('controllers_publications', __name__)


@controllers_publications.route("obtenir_publications_asso/<int:association_id>")
@login_required
def route_obtenir_publications_asso(association_id: int):
    """
    Renvoie toutes les publications d'une asso
    Avec les commentaires
    """
    try:
        publications = Publication.query.filter(Publication.id_association == association_id).all()
        return jsonify({"publications": [e.to_dict() for e in publications]}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@controllers_publications.route("<int:association_id>/creer_nouvelle_publication", methods=['POST'])
@login_required
@est_membre_de_asso
def route_creer_publication(association_id: int):
    """
    Ajoute une nouvelle publication dans la BDD. 
    """
    try:
        asso = Association.query.get(association_id)
        if asso:
            data = request.json
            publication = Publication(association=asso,
                                      auteur=current_user,
                                      titre=data["titre"],
                                      contenu=data["contenu"],
                                      date_publication=data["date_publication"],
                                      is_commentable=data["is_commentable"],
                                      a_cacher_to_cycles=data["a_cacher_to_cycles"],
                                      a_cacher_to_promos=data["a_cacher_to_promos"],
                                      is_publication_interne=data["is_publication_interne"]
                                      )
            db.session.add(publication)
            db.session.commit()
            return jsonify({"message": "Événement créé avec succès", "id_publication": publication.id}), 201
        else:
            return jsonify({"message": "association non trouvée"}), 404
    except Exception as e:
        return jsonify({"message": f"erreur lors de la création de l'événement : {e}"}), 500

@controllers_publications.route("<int:association_id>/supprimer_publication/<int:publication_id>", methods=["DELETE"])
@login_required
@est_membre_de_asso
def route_supprimer_publication(association_id, publication_id):
    publication = Publication.query.get(publication_id)
    if not publication:
        return jsonify({"message": "Publication non trouvé"}), 404
    db.session.delete(publication)
    db.session.commit()
    return jsonify({"message": "Publication supprimée avec succès"}), 200