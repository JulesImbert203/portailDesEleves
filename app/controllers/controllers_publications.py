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
            if not association_id in current_user.assos_actuelles.keys():
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
            id_publication = add_publication(association=asso,
                                             titre=data["titre"],
                                             contenu=data["contenu"],
                                             is_commentable=data["is_commentable"],
                                             a_cacher_to_cycles=data["a_cacher_to_cycles"],
                                             a_cacher_aux_nouveaux=data["a_cacher_aux_nouveaux"],
                                             is_publication_interne=data["is_publication_interne"]
                                             )
            return jsonify({"message": "événement créé avec succès", "id_publication": id_publication}), 201
        else:
            return jsonify({"message": "association non trouvée"}), 404
    except Exception as e:
        return jsonify({"message": f"erreur lors de la création de l'événement : {e}"}), 500


@controllers_publications.route("<int:association_id>/supprimer_publication/<int:publication_id>", methods=["DELETE"])
@login_required
@est_membre_de_asso
def route_supprimer_publication(association_id, publication_id):
    """
    Supprime la publication
    Ainsi que toutes les commentaires associés
    """
    publication = Publication.query.get(publication_id)
    if publication.a_cacher_aux_nouveaux and (not current_user.est_baptise):
        # Les non baptisés n'ont pas le droit de supprimer les posts cachés
        return jsonify({"message": "publication non trouvé"}), 404
    if not publication:
        return jsonify({"message": "publication non trouvé"}), 404
    remove_publication(publication)
    return jsonify({"message": "publication supprimée avec succès"}), 200


@controllers_publications.route("<int:association_id>/modifier_publication/<int:publication_id>", methods=["PUT"])
@login_required
@est_membre_de_asso
def route_modifier_publication(association_id, publication_id):
    """
    Modifie la publication
    Les commentaires associés sont inchangés
    """
    publication = Publication.query.get(publication_id)
    if publication:
        data = request.json
        if publication.a_cacher_aux_nouveaux and (not current_user.est_baptise):
            # Les non baptisés n'ont pas le droit de modifier les posts cachés
            return jsonify({"message": "publication non trouvé"}), 404
        modify_publication(publication,
                           data["titre"],
                           data["contenu"],
                           data["is_commentable"],
                           data["a_cacher_to_cycles"],
                           data["a_cacher_aux_nouveaux"],
                           data["is_publication_interne"])
        return jsonify({"message": "publication modifiée avec succès"}), 200
    else:
        return jsonify({"message": "publication non trouvée"}), 404


@controllers_publications.route("<int:association_id>/creer_nouveau_commentaire/<int:post_id>", methods=['POST'])
@login_required
def route_creer_commentaire(association_id: int, post_id: int):
    """
    Ajoute un nouveau commentaire à la publication.
    """
    try:
        asso = Association.query.get(association_id)
        if asso:
            post = Publication.query.get(post_id)
            if post:
                data = request.json
                if post.a_cacher_aux_nouveaux and (not current_user.est_baptise):
                    # Les non baptisés n'ont pas le droit de commenter les posts cachés
                    return jsonify({"message": "publication non trouvé"}), 404
                comment_id = add_comment(post, asso, data.contenu)
                return jsonify({"message": "commentaire créé avec succès", "comment_id": comment_id}), 201
            else:
                return jsonify({"message": "publication non trouvée"}), 404
        else:
            return jsonify({"message": "association non trouvée"}), 404
    except Exception as e:
        return jsonify({"message": f"erreur lors de la création du commentaire: {e}"}), 500
