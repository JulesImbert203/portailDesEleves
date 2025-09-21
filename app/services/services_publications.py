from app.services import db
from app.models import *
from flask_login import current_user
from sqlalchemy.orm.attributes import flag_modified

from app.models.models_publications import Publication, Commentaire
from app.models.models_associations import Association
from app.models.models_utilisateurs import Utilisateur

# Gestion de publications


def add_publication(association: Association, titre: str, contenu: str, is_commentable: bool, a_cacher_to_cycles: list, a_cacher_aux_nouveaux: bool, is_publication_interne: bool):
    """
    Ajoute une publication à l'association
    """
    association = Association.query.get(association.id)
    if association:
        publication = Publication(association=association,
                                  auteur=current_user,
                                  titre=titre,
                                  contenu=contenu,
                                  date_publication=datetime.now(),
                                  is_commentable=is_commentable,
                                  a_cacher_to_cycles=a_cacher_to_cycles,
                                  a_cacher_aux_nouveaux=a_cacher_aux_nouveaux,
                                  is_publication_interne=is_publication_interne
                                  )
        db.session.add(publication)
        db.session.commit()
        return publication.id
    else:
        raise ValueError("L'association n'existe pas")


def modify_publication(publication: Publication, titre: str, contenu: str, is_commentable: bool, a_cacher_to_cycles: list, a_cacher_aux_nouveaux: bool, is_publication_interne: bool):
    """
    Ajoute une publication à l'association
    """
    publication = Publication.query.get(publication.id)
    if publication:
        publication.titre = titre
        publication.contenu = contenu
        publication.is_commentable = is_commentable
        publication.a_cacher_to_cycles = a_cacher_to_cycles
        publication.a_cacher_aux_nouveaux = a_cacher_aux_nouveaux
        publication.is_publication_interne = is_publication_interne
        db.session.commit()
    else:
        raise ValueError("La publication n'existe pas")

def modify_comment(commentaire: Commentaire, contenu: str):
    """
    Modifie le commentaire
    """
    commentaire = Commentaire.query.get(commentaire.id)
    if commentaire:
        commentaire.contenu = contenu
        db.session.commit()
    else:
        raise ValueError("Le commentaire n'existe pas")


def remove_publication(publication: Publication):
    """
    Retire une publication de l'association
    """
    publication = Publication.query.get(publication.id)
    if publication:
        db.session.delete(publication)
        db.session.commit()
    else:
        raise ValueError("La publication n'existe pas")


def add_like(publication: Publication, utilisateur: Utilisateur):
    """
    Ajoute un like à la publication
    """
    publication = Publication.query.get(publication.id)
    if publication:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            likes = publication.likes
            if utilisateur.id not in likes:
                likes.append(utilisateur.id)
            publication.likes = likes
        else:
            raise ValueError("L'utilisateur n'existe pas'")
    else:
        raise ValueError("La publication n'existe pas")


def remove_like(publication: Publication, utilisateur: Utilisateur):
    """
    Retire un like de la publication
    """
    publication = Publication.query.get(publication.id)
    if publication:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            likes = publication.likes
            likes.remove(utilisateur.id)
            publication.likes = likes
        else:
            raise ValueError("L'utilisateur n'existe pas'")
    else:
        raise ValueError("La publication n'existe pas")


def modify_like_post(publication: Publication, utilisateur: Utilisateur):
    """
    Rajoute un like sur la publication s'il n'est pas déjà présent
    Retire ce like sinon
    """
    publication = Publication.query.get(publication.id)
    if publication:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            likes = publication.likes
            if utilisateur.id in likes:
                likes.remove(utilisateur.id)
            else:
                likes.append(utilisateur.id)
            publication.likes = likes
            flag_modified(publication, "likes")
            db.session.commit()
        else:
            raise ValueError("L'utilisateur n'existe pas'")
    else:
        raise ValueError("La publication n'existe pas")

# Les commentaires


def modify_like_comment(commentaire: Commentaire, utilisateur: Utilisateur):
    """
    Rajoute un like sur le commentaire s'il n'est pas déjà présent
    Retire ce like sinon
    """
    commentaire = Commentaire.query.get(commentaire.id)
    if commentaire:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            likes = commentaire.likes
            if utilisateur.id in likes:
                likes.remove(utilisateur.id)
            else:
                likes.append(utilisateur.id)
            commentaire.likes = likes
            flag_modified(commentaire, "likes")
            db.session.commit()
        else:
            raise ValueError("L'utilisateur n'existe pas'")
    else:
        raise ValueError("Le commentaire n'existe pas")


def add_comment(publication: Publication, auteur: Utilisateur, contenu: str):
    """
    Ajoute un commentaire à la publication
    """
    publication = Publication.query.get(publication.id)
    if publication:
        auteur = Utilisateur.query.get(auteur.id)
        if auteur:
            if publication.is_commentable == True:
                new_comment = Commentaire(
                    auteur=auteur,
                    contenu=contenu,
                    date=datetime.now(),
                    publication=publication
                )
                db.session.add(new_comment)
                db.session.commit()
                return new_comment.id
            else:
                raise ValueError("La publication n'est pas commentable")
        else:
            raise ValueError("L'auteur n'existe pas")
    else:
        raise ValueError("La publication n'existe pas")


def remove_comment(commentaire: Commentaire):
    """
    Retire un commentaire de la publication
    """
    commentaire = Commentaire.query.get(commentaire.id)
    if commentaire:
        db.session.delete(commentaire)
        db.session.commit()
    else:
        raise ValueError("Le commentaire n'existe pas")


def add_like_to_comment(utilisateur: Utilisateur, commentaire: Commentaire):
    """
    Ajoute un like à un commentaire
    """
    commentaire = Commentaire.query.get(commentaire.id)
    if commentaire:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            likes = commentaire.likes
            if utilisateur.id not in likes:
                likes.append(utilisateur.id)
            commentaire.likes = likes
        else:
            raise ValueError("L'utilisateur n'existe pas")
    else:
        raise ValueError("Le commentaire n'existe pas")


def remove_like_from_comment(utilisateur: Utilisateur, commentaire: Commentaire):
    """
    Retire un like d'un commentaire
    """
    commentaire = Commentaire.query.get(commentaire.id)
    if commentaire:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            likes = commentaire.likes
            likes.remove(utilisateur.id)
            commentaire.likes = likes
        else:
            raise ValueError("L'utilisateur n'existe pas")
    else:
        raise ValueError("Le commentaire n'existe pas")
