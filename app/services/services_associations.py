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
