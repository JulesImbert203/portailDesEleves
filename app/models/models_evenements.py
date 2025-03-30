from app import db
import os
import re
import shutil
from datetime import datetime
from app.models.models_associations import Association


def est_heure_HHMM(heure_str):
    try:
        datetime.strptime(heure_str, "%H%M")
        return True
    except ValueError:
        return False
    
def est_date_AAAAMMJJHHMM(date_str):
    try:
        datetime.strptime(date_str, "%Y%m%d%H%M")
        return True
    except ValueError:
        return False
    
def est_valide_liste_de_jours(liste_jours) :
    for jour in liste_jours :
        if jour not in ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']:
            return False
    return True
    
class Evenement (db.Model):
    __tablename__ = 'evenements'
    #ID de l'évènement
    id = db.Column(db.Integer, primary_key=True)
    #ID de l'association organisatrice
    id_association = db.Column(db.Integer, nullable=True)
    nom_association = db.Column(db.String(1000), nullable=False)
    #elements ajoutés à la création de l'évènement - Modifiables par les membres de l'association
    nom = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.Text, nullable=True)
    lieu = db.Column(db.String(1000), nullable=True)
    evenement_periodique = db.Column(db.Boolean, nullable=False)
    evenement_masque = db.Column(db.Boolean, nullable=False)
    # evenements non periodiques uniquement - AAAAMMJJHHMM
    date_de_debut = db.Column(db.String(100), nullable=True)
    date_de_fin = db.Column(db.String(100), nullable=True)
    # evenements periodiques uniquement
    jours_de_la_semaine = db.Column(db.JSON, nullable=True)
    heure = db.Column(db.String(100), nullable=True)
    dates_annulation = db.Column(db.JSON, nullable=True) # liste au format AAAAMMJJ, les evenements periodiques ne seront pas affiches ces jours la

    def __init__(self, id_association:int, nom:str, description:str, lieu:str, evenement_periodique:bool, date_de_debut:str=None, date_de_fin:str=None, jours_de_la_semaine:list=None, heure:str =None) :
        
        """"
        Crée un nouvel évènement
        """
        self.id_association = id_association
        self.nom_association = Association.query.get(id_association).nom
        #self.nom_dossier = re.sub(r'\W+', '', self.nom_association).lower()
        self.nom = nom
        self.description = description
        self.lieu = lieu
        self.evenement_periodique = evenement_periodique
        if evenement_periodique :
            if est_valide_liste_de_jours(jours_de_la_semaine) :
                self.jours_de_la_semaine = jours_de_la_semaine
            else :
                raise ValueError("Liste de jours de la semaine invalide (exemple de format accepte : ['lundi', 'mercredi'])")
            if est_heure_HHMM(heure) : 
                self.heure = heure
            else :
                raise ValueError(f"format d'heure/minutes de '{heure}' invalide. La date doit etre au format HHMM")
            self.date_de_debut = None
            self.date_de_fin = None
        else :
            if est_date_AAAAMMJJHHMM(date_de_debut) :
                self.date_de_debut = date_de_debut
            else :
                raise ValueError(f"format de date de '{date_de_debut}' invalide. La date doit etre au format AAAAMMJJHHMM")
            if est_date_AAAAMMJJHHMM(date_de_fin) :
                self.date_de_fin = date_de_fin
            else :
                raise ValueError(f"format de date de '{date_de_fin}' invalide. La date doit etre au format AAAAMMJJHHMM")
            self.heure = None
            self.jours_de_la_semaine = None
        self.evenement_masque = False
        self.dates_annulation = []

        #self.create_evenement_folder()

    def __update__(self, 
                   nom:str=None,
                   description:str=None,
                   lieu:str=None,
                   evenement_masque:bool=None,

                   evenement_periodique:bool=None,

                   date_de_debut:str=None,
                   date_de_fin:str=None,
                    
                   jours_de_la_semaine : list=None,
                   heure : str = None
                   ) : 

        """            
        Modifie les valeurs d'un évènement, puis met a jour la base de donnee.

        Les formats a respecter sont listes si apres. Cette doumentation fait autorite
        quant au format que doit avoir la class évènement

        /!\ Sauf exceptions la table évènement n'est pas vouee a etre modifiee a la main.
        Cette fonction sera utilisee au sein de fonctions bien precises.

        ----------------------
        - nom : str
            Nom de l'évènement, peut contenir des accents et des caracteres speciaux.
        - description : str
            Description de l'évènement, peut contenir des accents et des caracteres speciaux 
            ainsi que des sauts de ligne et des informations de mise en page HTML.
        - date_de_debut : str
            Date de début de l'évènement au format AAAAMMJJHHMM
            Il s'agit de la date de début de l'évènement s'il n'est pas périodique, None s'il est périodique
        - date_de_fin : str
            Date de fin de l'évènement au format AAAAMMJJHHMM s'il n'est pas périodique, None s'il est périodique
        - lieu : str
            Lieu de l'évènement, peut contenir des accents et des caracteres speciaux.
        - evenement_masque : bool
            True si l'évènement est masqué, False sinon
        - evenement_periodique : bool
            True si l'évènement est périodique, False sinon
        - jours_de_la_semaine : list
            Liste des jours de la semaine où l'évènement a lieu, None s'il n'est pas périodique
        - heure : str
            Heure de l'évènement, au format HHMM
        """
        
        if nom != None :
            self.nom = nom

        if description != None :
            self.description = description

        if date_de_debut != None :
            self.date_de_debut = date_de_debut

        if date_de_fin != None :
            self.date_de_fin = date_de_fin

        if lieu != None :
            self.lieu = lieu

        if evenement_masque != None :
            self.evenement_masque = evenement_masque

        if evenement_periodique != None :
            self.evenement_periodique = evenement_periodique

        if jours_de_la_semaine != None :
            self.jours_de_la_semaine = jours_de_la_semaine
        
        if heure != None :
            self.heure = heure
    


 #   def create_evenement_folder(self) :
        """
        Crée un dossier pour l'évènement
        """
        #nettoyer le nom de l'association en ne gardant que les caractères alphanumériques en minuscule
        

       # os.mkdir(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}_{self.heure.replace(':','')}")
    
    #def remove_evenement_folder(self) :
        """
        Supprime le dossier de l'évènement
        """
        #shutil.rmtree(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}_{self.heure.replace(':','')}")
    
    #def change_visibility(self) :
        """
        Change la visibilité de l'évènement
        """
     #   self.evenement_masque = not self.evenement_masque
    
   # def add_img(self, file,img_order : int) :
        """
        Ajoute une image à l'évènement
        """
    #    file_path = f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{img_order}_{file.filename}"

     #   file.save(file_path)

    #def remove_img(self, img_order : int) :
        """"
        Supprime une image de l'évènement
        """
     #   for file in os.listdir(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}"):
      #      if file.startswith(f"{img_order}_"):
       #         file_path = f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{file}"
        #        os.remove(file_path)
         #       break
        
        #mettre à jour les ordres des images restantes
        #for file in os.listdir(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}"):
         #   if int(file.split('_')[0]) > img_order:
          #      os.rename(f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{file}",
           #               f"app/static/associations/{self.nom_dossier}/evenements/{self.date}/{int(file.split('_')[0])-1}_{file.split('_')[1]}")
