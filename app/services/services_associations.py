# importer les models grace a __init__.py de models
from app.services import db
from app.models import *


#### GESTION DES ASSOCIATIONS

def add_member(association:Association, utilisateur:Utilisateur, role:str) :
        """
        Ajoute un membre à l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                association.membres.append({'id': utilisateur.id, 'nom_utilisateur':utilisateur.nom_utilisateur, 'role': role})
                utilisateur.assos_actuelles[association.id] = role
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
    
def remove_member(association:Association,utilisateur:Utilisateur) :
        """
        Retire un membre de l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        Ne renvoie pas d'erreur si l'utilisateur n'est pas membre de l'association
        """
        association=Association.query.get(association.id)

        if association:
        
            utilisateur=Utilisateur.query.get(utilisateur.id)

            if utilisateur:
                for membre in association.membres:
                    if membre['id'] == utilisateur.id:
                        association.membres.remove(membre)
                        utilisateur.assos_actuelles.pop(str(association.id))
                        break
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
        

def update_member_role(association:Association, utilisateur:Utilisateur, role:str) :
        """
        Modifie le role d'un membre de l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        Ne renvoie pas d'erreur si l'utilisateur n'est pas membre de l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                for membre in association.membres:
                    if membre['id'] == utilisateur.id:
                        membre['role'] = role
                        utilisateur.assos_actuelles[association.id] = role
                        break
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
   

    
def update_members_order(association : Association, members_weights:list) :
        """
        Modifie l'ordre des membres de l'association en fonction de leur poids
        """
        association=Association.query.get(association.id)
        if association:
            membres=association.membres

            # création d'une liste de tuples contenant le poids, le nom et l'index du membre
            ordres=[[members_weights[i],membres[i]['nom_utilisateur'],i] for i in range(len(membres))]
            
            # tri des membres en fonction de leur poids puis de leur nom
            ordres.sort(key=lambda x: (-x[0],x[1]))

            # mise à jour de l'ordre des membres
            membres=[membres[ordre[2]] for ordre in ordres]

            association.membres=membres
        else:
            raise ValueError("L'association n'existe pas")

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
        

### Gestion des évènements

def change_event_visibility(evenement: Evenement):
     
        """
        Change la visibilité d'un évènement
        """
        evenement=Evenement.query.get(evenement.id)
        if evenement:
            evenement.change_visibility()
        else:
            raise ValueError("L'évènement n'existe pas")
        

def supprimer_evenement(evenement: Evenement) :
        
        "Supprime un évènement"

        evenement=Evenement.query.get(evenement.id)

        if evenement:
             
                #evenement.delete_folder()
                db.session.delete(evenement)
        
        else:
            raise ValueError("L'évènement n'existe pas")