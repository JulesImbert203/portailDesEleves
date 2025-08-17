# importer les models grace a __init__.py de models
from app.services import db
from app.models import *
from sqlalchemy.orm.attributes import flag_modified


#### GESTION DES ASSOCIATIONS
def create_association(nom:str, description:str, type_association:str, logo_path:str, ordre_importance:int) -> Association:
    """
    Crée une nouvelle association
    """
    association = Association(nom, description, type_association, logo_path, ordre_importance)
    db.session.add(association)
    db.session.commit()
    return association.id


def get_association(association_id) -> Association:  
    """Renvoie un utilisateur depuis son id"""
    if association_id:
        return db.session.get(Association, association_id)
    else:
        return None

def add_member(association:Association, utilisateur:Utilisateur, role:str) :
        """
        Ajoute un membre à l'association
        Renvoie une erreur si l'utilisateur ou l'association n'existe pas
        Renvoie également une erreur si l'utilisateur est déjà dans l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                for membre in association.membres:
                     if membre['id'] == utilisateur.id:
                          raise ValueError("L'utilisateur est déjà dans l'association")
                association.membres.append({'id': utilisateur.id, 'nom_utilisateur':utilisateur.nom_utilisateur, 'role': role, 'position' : 0})
                utilisateur.assos_actuelles[association.id] = role
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
        
        flag_modified(association, 'membres')
        db.session.commit()
    
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
        
        flag_modified(association, 'membres')
        db.session.commit()
        

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
        
        flag_modified(association, 'membres')
        db.session.commit()
   
def update_member_position(association : Association, utilisateur:Utilisateur, position:int) :
        """
        Modifie la position de l'utilisateur das l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                for membre in association.membres:
                    if membre['id'] == utilisateur.id:
                        membre['position'] = position
                        break
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
        
        flag_modified(association, 'membres')
        db.session.commit()

def update_members_order(association : Association) :
        """
        Modifie l'ordre des membres de l'association en fonction de leur position.
        """
        association=Association.query.get(association.id)
        if association:
            # tri des membres en fonction de leur position puis de leur nom
            association.membres.sort(key=lambda member: (-member['position'], member['nom_utilisateur']))
        else:
            raise ValueError("L'association n'existe pas")
        
        flag_modified(association, 'membres')
        db.session.commit()


def passation(association : Association, new_members = list, new_roles = list): #nouveaux membres et rôles dans l'ordre
    """
        Pour faire la passation de l'asso
        envoie tous les anciens membres de l'asso dans anciens_membres puis ajoute tous les nouveaux
    """
    association=Association.query.get(association.id)
    if association:
        for member in association.membres:
            user = Utilisateur.query.get(member['id'])
            if user:
                association.anciens_membres.append({
                    'id': user.id,
                    'nom_utilisateur': user.nom_utilisateur,
                    'prenom': user.prenom,
                    'nom_de_famille': user.nom_de_famille,
                    'role': member['role'],
                    'mandat' : user.promotion
                })
                user.anciennes_assos[association.id] = (user.promotion, member['role'])
                flag_modified(user, 'anciennes_assos')

        association.membres = [] 
        for member, role in zip(new_members, new_roles):
            add_member(association, member, role)   
      
        flag_modified(association, 'membres', 'ancien_membres')
        db.session.commit()

