from app.services import db


from app.models.models_evenements import Evenement

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