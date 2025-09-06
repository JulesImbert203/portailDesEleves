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
        query = Publication.query.filter(Publication.id_association == association_id)
        if not (current_user.est_superutilisateur):
            # publications internes
            if not association_id in current_user.associations_actuelles.keys():
                query = query.filter(Publication.is_publication_interne.is_(False))
            # publications sensibles
            if not current_user.est_baptise:
                query = query.filter(Publication.a_cacher_aux_nouveaux.is_(False))
            # publications spécifiques aux differents cycles
            query = query.filter(~Publication.a_cacher_to_cycles.contains(current_user.cycle))
        publications = query.order_by(desc(Publication.date_publication)).all()
        return jsonify({"publications": [{"id": e.id,
                                          "auteur": e.auteur.nom_utilisateur if e.auteur else None,
                                          "titre": e.titre,
                                          "contenu": e.contenu,
                                          "date_publication": e.date_publication,
                                          "likes": e.likes,
                                          "is_commentable": e.is_commentable,
                                          "commentaires": [comment.to_dict() for comment in e.commentaires]}
                                         for e in publications]}), 200
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
                                      date_publication=datetime.now(),
                                      is_commentable=data["is_commentable"],
                                      a_cacher_to_cycles=data["a_cacher_to_cycles"],
                                      a_cacher_aux_nouveaux=data["a_cacher_aux_nouveaux"],
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
