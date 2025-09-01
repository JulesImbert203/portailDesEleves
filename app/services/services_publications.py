from app.services import db
from app.models import *


from app.models.models_publications import Publication, Commentaire
from app.models.models_associations import Association
from app.models.models_utilisateurs import Utilisateur

# Gestion des publications


def add_publication(association: Association, utilisateur: Utilisateur, titre: str, contenu: str, date: str, heure: str):
    """
    Ajoute une publication à l'association
    """
    association = Association.query.get(association.id)
    if association:
        utilisateur = Utilisateur.query.get(utilisateur.id)
        if utilisateur:
            publication = Publication(titre=titre, contenu=contenu, auteur=utilisateur,
                                      date=date, heure=heure, association=association)
            db.session.add(publication)
            db.session.commit()
        else:
            raise ValueError("L'utilisateur n'existe pas")
    else:
        raise ValueError("L'association n'existe pas")


def remove_publication(association: Association, publication: Publication):
    """
    Retire une publication de l'association
    """
    association = Association.query.get(association.id)
    if association:
        publication = Publication.query.get(publication.id)
        if publication:
            db.session.delete(publication)
            db.session.commit()
        else:
            raise ValueError("La publication n'existe pas")
    else:
        raise ValueError("L'association n'existe pas")


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


def add_comment(publication: Publication, auteur: Utilisateur, contenu: str, date: datetime):
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
                    date_creation=date,
                    publication=publication
                )
                db.session.add(new_comment)
                db.session.commit()
            else:
                raise ValueError("La publication n'est pas commentable")
        else:
            raise ValueError("L'auteur n'existe pas")
    else:
        raise ValueError("La publication n'existe pas")


def remove_comment(publication: Publication, commentaire: Commentaire):
    """
    Retire un commentaire de la publication
    """
    publication = Publication.query.get(publication.id)
    if publication:
        commentaire = Commentaire.query.get(commentaire.id)
        if commentaire:
            db.session.delete(commentaire)
            db.session.commit()
        else:
            raise ValueError("Le commentaire n'existe pas")
    else:
        raise ValueError("La publication n'existe pas")


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
