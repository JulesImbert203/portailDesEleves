# Logique metier de l'application



# - - - -
# Regles generales : 
#
# * Pas de db.session.commit dans ces fonctions. Ces fonctions agissent sur les classes, 
# mais les changements ne sont enregistres par db.session.commit() qu'au sein des routes
# flaks (dans views/) pour des raisons de performance (par exemple, il vaut mieux mettre 
# a jour une fois apres avoir modifie trois utilisateurs que mettre a jour trois fois, 
# une fois par utilisateur).
#
# * Attention a ne jamais commit un changement ayant renvoye une erreur


from app import db
from app.models import Utilisateur,Sondage, AppConfig, VoteSondageDuJour, Association, Publication, Commentaire


#### Lien entre les utilisateurs

# Erreur levee si l'une de ces fonctions echoue
class ErreurDeLienUtilisateurs(Exception):
    def __init__(self, message):
        super().__init__(message)

# CO

def supprimer_co(utilisateur1:Utilisateur, utilisateur2:Utilisateur):
    """
    Supprime le lien de colocation entre les deux utilisateurs. 
    Leve si les deux utilisateurs ne sont pas co
    """
    if utilisateur1.co_id == utilisateur2.id and utilisateur2.co_id == utilisateur1.id : # les deux sont co
            utilisateur1.update(co_id=None, co_nom=None)
            utilisateur2.update(co_id=None, co_nom=None)        
    else :
        raise ErreurDeLienUtilisateurs("Erreur : les deux utilisateurs ne sont pas co.") # sinon erreur
    # pas de db.session.commit()

def creer_co(utilisateur1:Utilisateur, utilisateur2:Utilisateur):
    """
    Crée un lien de colocation entre deux utilisateurs en modifiant leurs attributs.
    Si l'un des deux utilisateurs avait deja un co, le lien precedent est detruit. 
    """
    if utilisateur1.co_id == None and utilisateur2.co_id == None : # les deux sont libres : on cree le lien
        utilisateur1.update(co_id=utilisateur2.id, co_nom=f"{utilisateur2.prenom} {utilisateur2.nom_de_famille}")
        utilisateur2.update(co_id=utilisateur1.id, co_nom=f"{utilisateur1.prenom} {utilisateur1.nom_de_famille}")         
    else :
        if utilisateur1.co_id != None : # 1 a un co : on le supprime
            co_utilisateur1 = db.session.get(Utilisateur, utilisateur1.co_id)
            supprimer_co(utilisateur1, co_utilisateur1)
        if utilisateur2.co_id != None : # 2 a un co : on le supprime
            co_utilisateur2 = db.session.get(Utilisateur, utilisateur2.co_id)
            supprimer_co(utilisateur2, co_utilisateur2)
        # Les deux sont libres : on met a jour
        utilisateur1.update(co_id=utilisateur2.id, co_nom=f"{utilisateur2.prenom} {utilisateur2.nom_de_famille}")
        utilisateur2.update(co_id=utilisateur1.id, co_nom=f"{utilisateur1.prenom} {utilisateur1.nom_de_famille}")
    # pas de db.session.commit()       

# PARRAINAGE

def ajouter_fillots_a_la_famille(marrain:Utilisateur, liste_fillots:Utilisateur) :
    """
    Ajoute une liste de fillots a la famille. Si des fillots existent deja, une erreur est levee.
    Si l'un des fillots possede deja un marrain, une erreur est levee. 
    Ne devra etre utilisee qu'une fois, au moment d'ajouter ses fillots au parrainnage. 
    """
    if marrain.fillots_dict == None : # verification que le marrain est libre
        # verification que chaque fillot est libre 
        for fillot in liste_fillots :
            if fillot.marrain_id != None or fillot.marrain_nom != None :
                raise ErreurDeLienUtilisateurs(f"Erreur : {fillot.prenom} {fillot.nom_de_famille} a deja un marrain.")

        # modification
        fillots_dict = dict()
        marrain_id = marrain.id
        for fillot in liste_fillots :
            fillot.update(marrain_id=marrain_id, marrain_nom=f"{marrain.prenom} {marrain.nom_de_famille}")
            fillots_dict[fillot.id] = f"{fillot.prenom} {fillot.nom_de_famille}"
        marrain.update(fillots_dict=fillots_dict)
    else :
        raise ErreurDeLienUtilisateurs("Erreur : l'utilisateur marrain a deja des fillots. utilisez la fonction de suppression.")

def supprimer_fillots(marrain:Utilisateur) :
    """
    Supprime les fillots d'un utilisateur. Ne renvoie pas d'erreur si l'utilisateur n'a pas de fillot. 
    Supprime donc en consequence le marrain des fillots concernes
    Verifie avant de modifier le fillot que le lien etait bien comme il devait etre
    Cette fonction ne doit etre utilisee qu'en cas d'erreur lors de l'attribution des fillots
    """
    if marrain.fillots_dict != None :
        for fillot_id in marrain.fillots_dict:
            fillot = Utilisateur.query.get(fillot_id)
            if fillot :
                if fillot.marrain_id == marrain.id :
                    fillot.update(marrain_id=None, marrain_nom=None)
                else :
                    raise ErreurDeLienUtilisateurs(f"le fillot {marrain.fillots_dict[fillot_id]}, present dans la liste des fillots de {marrain.nom_utilisateur} n'a pas enregistre {marrain.nom_utilisateur} comme marrain.")
            else :
                raise ErreurDeLienUtilisateurs(f"le fillot d'id {fillot_id}, present dans la liste des fillots de {marrain.nom_utilisateur} n'existe pas.")
        marrain.update(fillots_dict=None)   


#### VOTE A UN SONDAGE

# ATTENTION : Aucune des fonctions suivantes concernant les sondages n'ont ete testees

def creer_vote_sondage_du_jour(utilisateur:Utilisateur, vote:int) :
    """
    Fait voter un utilisateur a un sondage
    Met a jour utilisateur.vote_sondaj_du_jour
    Met a jour le nombre de votes du sondage de la reponse du sondage en question dans la table "votes_sondage_du_jour"
    - vote doit etre 1, 2, 3 ou 4. Cette fonction ne verifie pas si le vote est possible (ex : reponse 4 alors qu'il n'y a que 3 reponses possibles)
    """
    utilisateur.vote_sondaj_du_jour = vote
    utilisateur.nombre_participations_sondaj += 1
    nouveau_vote = VoteSondageDuJour(id_utilisateur=utilisateur.id, numero_vote=vote)
    return nouveau_vote
    # utilisation au sein d'une route :  
    # nouveau_vote = creer_vote_sondage_du_jour(utilisateur, numero_vote)
    # db.session.add(nouveau_vote)
    # db.session.commit()

def valider_sondage(sondage:Sondage) :
    """
    Valide un sondage. Cette fonction ne pourra etre utilisee que par le vp_sondaj
    """
    if sondage.status :
        print("Sondage deja valide.")
    else :
        sondage.status = True

def renvoyer_id_sondage_du_jour_et_passer_au_suivant() :
    """
    Cette fonction sera appelee automatiquent chaque jour a minuit pour changer de sondage du jour
    Les votants updateront leur nombre de victoire
    Le sondage du jour sera mis a jour
    Renvoie l'id du sondage du jour pour pourvoir le supprimer de la base des sondages et le mettre dans la base des anciens sondages
    """
    # obtention de la reponse gagnante :
    appConfig = AppConfig.get()
    id_sondage_du_jour = appConfig.id_sondage_du_jour
    sondage_du_jour = Sondage.query.get(id_sondage_du_jour)
    # comptage des votes : 
    votes_sondage_du_jour = VoteSondageDuJour.query.all()
    votes = [vote.numero_vote for vote in votes_sondage_du_jour]
    compteur_votes = Counter(votes)  # Dictionnaire {vote: nombre}
    max_votes = max(compteur_votes.values(), default=0)
    votes_gagnants = [vote for vote, count in compteur_votes.items() if count == max_votes]
    # mise a jour des victoires des utilisateurs 
    for vote in votes_sondage_du_jour :
        if vote.numero_vote in votes_gagnants :
            utilisateur_gagnant = Utilisateur.query.get(vote.id_utilisateur)
            utilisateur_gagnant.nombre_victoires_sondaj += 1
    # Mise a jour : nouveau sondage du jour
    nouveau_sondage_du_jour = (
        Sondage.query.filter(Sondage.status == 1, Sondage.id != id_sondage_du_jour)
        .order_by(Sondage.date_sondage)
        .first()
    )
    # Mettre a jour si le sondage existe
    if nouveau_sondage_du_jour:
        AppConfig.set("id_sondage_du_jour", nouveau_sondage_du_jour.id)
    return id_sondage_du_jour

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
                        utilisateur.assos_actuelles.pop(association.id)
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


def add_publication(association:Association, utilisateur:Utilisateur, titre:str, contenu:str, date:str) :
        """
        Ajoute une publication à l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                publication = Publication(titre=titre, contenu=contenu, auteur=utilisateur.id, date=date)
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

def add_like(association : Association, utilisateur:Utilisateur, index_publication:int) :
        """
        Ajoute un like à une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                association.publications[index_publication].add_like(utilisateur.id)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
    

def remove_like(association : Association, utilisateur:Utilisateur, index_publication:int) :
        """
        Retire un like d'une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            utilisateur=Utilisateur.query.get(utilisateur.id)
            if utilisateur:
                association.publications[index_publication].remove_like(utilisateur.id)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")  

def add_comment(association : Association, auteur:Utilisateur, index_publication:int, contenu:str, date:str) :
        """
        Ajoute un commentaire à une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            auteur=Utilisateur.query.get(auteur.id)
            if auteur:
                commentaire = Commentaire(contenu=contenu, auteur=auteur.id, date=date)
                association.publications[index_publication].add_comment(commentaire)
            else:
                raise ValueError("L'utilisateur n'existe pas")
        else:
            raise ValueError("L'association n'existe pas")
    
def remove_comment(association : Association, index_publication:int, index_comment:int) :
        """
        Retire un commentaire d'une publication de l'association
        """
        association=Association.query.get(association.id)
        if association:
            del association.publications[index_publication].commentaires[index_comment]
        else:
            raise ValueError("L'association n'existe pas")
      