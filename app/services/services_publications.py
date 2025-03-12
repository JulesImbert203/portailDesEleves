from app.services import db
from app.models import *


from app.models.models_publications import Publication
from app.models.models_associations import Association
from app.models.models_utilisateurs import Utilisateur

### Gestion des publications

def add_publication(association:Association, utilisateur:Utilisateur, titre:str, contenu:str, date:str, heure:str) :
        """
        Ajoute une publication à l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                publication = Publication(titre=titre, contenu=contenu, auteur=utilisateur.id, date=date, heure=heure)
                association.publications.append(publication)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")


def remove_publication(association : Association, index_publication:int) :
        """
        Retire une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            del association.publications[index_publication]
        else:
            raise ValueError("L'association n'existe pas")

def add_like(publication:Publication, utilisateur:Utilisateur) :
    """
    Ajoute un like à la publication
    """
    publication=Publication.query.get(publication.id)
    likes = publication.likes
    likes.append(utilisateur.id)
    likes = list(set(likes))
    publication.likes = likes
        

def remove_like(publication:Publication, utilisateur:Utilisateur) :
    """
    Retire un like de la publication
    """
    publication=Publication.query.get(publication.id)
    likes = publication.likes
    likes.remove(utilisateur.id)
    publication.likes = likes

def add_comment(publication : Publication,auteur:Utilisateur, contenu:str, date:str):
    """
    Ajoute un commentaire à la publication
    """
    publication=Publication.query.get(publication.id)
    auteur=Utilisateur.query.get(auteur.id)
    if publication.is_commentable == True :

        new_comment = {
            "auteur": auteur.id,
            "contenu": contenu,
            "date": date,
            "likes": []
        }
        
        publication.commentaires.append(new_comment)
    
    else:
        raise ValueError("La publication n'est pas commentable")

def remove_comment(publication:Publication, id_commentaire:int):
    """
    Retire un commentaire de la publication
    """
    publication=Publication.query.get(publication.id)
    del publication.commentaires[id_commentaire]

def add_like_to_comment(publication: Publication,utilisateur:Utilisateur, id_commentaire:int):
    """
    Ajoute un like à un commentaire
    """
    publication=Publication.query.get(publication.id)
    utilisateur=Utilisateur.query.get(utilisateur.id)

    likes = publication.commentaires[id_commentaire]['likes']
    likes.append(utilisateur.id)
    likes = list(set(likes))
    publication.commentaires[id_commentaire]['likes'] = likes

def remove_like_from_comment(publication: Publication,utilisateur:Utilisateur, id_commentaire:int):
    """
    Retire un like d'un commentaire
    """
    publication=Publication.query.get(publication.id)
    utilisateur=Utilisateur.query.get(utilisateur.id)
    
    likes = publication.commentaires[id_commentaire]['likes']
    likes.remove(utilisateur.id)
    publication.commentaires[id_commentaire]['likes'] = likes