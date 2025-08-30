from flask import Blueprint, request, redirect, url_for,render_template
import os
from flask_login import login_required, current_user
import zipfile
import fitz
from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *
from app.services.services_vendomes import main_vendome, ajouter_vendome_a_bdd


# Creer le blueprint pour les utilisateurs
controllers_vendomes = Blueprint('controllers_vendomes', __name__)

UPLOAD_VENDOME_FOLDER= 'app/uploads/vendomes'
controllers_vendomes.config['UPLOAD_VENDOME_FOLDER'] = UPLOAD_VENDOME_FOLDER

@controllers_vendomes.route('/upload_vendome', methods=['POST'])
def upload_file():
    nom= request.form['nom']
    date_parution= request.form['date_parution']
    cache_aux_1A= request.form['cache_aux_1A']
    edition_speciale= request.form['edition_speciale']
    particularite= request.form['particularite']
    vendome_liste= request.form['vendome_liste']

    # Ajouter le vendome à la base de données
    ajouter_vendome_a_bdd(nom, date_parution, cache_aux_1A, edition_speciale, particularite, vendome_liste)
    
    vendome_folder= f'app/uploads/vendomes/vendome_{date_parution}'
    if particularite:
        vendome_folder+=f'_{particularite}'

    if vendome_liste:
        vendome_folder+=f'_{vendome_liste}'

    pdf = request.files['pdf']
        
    if pdf and pdf.filename.endswith('.pdf'):
       
        file_path = os.path.join(vendome_folder,'vendome.pdf')
        pdf.save(file_path)
    
    else:
        return 'Fichier PDF non valide'
    
    miniature = request.files['miniature']
    
    #Vérifier si le fichier est une image
    if miniature and miniature.filename.endswith(('.jpg','.png','.jpeg')):
        file_path = os.path.join(vendome_folder,'miniature.jpg')
        miniature.save(file_path)

    #Sinon, récupérer la première page du PDF pour en faire la miniature
    else:
        pdf_path = os.path.join(vendome_folder,'vendome.pdf')
        miniature_path = os.path.join(vendome_folder,'miniature.png')
        doc = fitz.open(pdf_path)
        page = doc[0]
        pix = page.get_pixmap()
        pix.writePNG(miniature_path)



    indesign = request.files['indesign']
    if indesign.filename == '':
        return 'Aucun fichier sélectionné'
    if indesign and indesign.filename.endswith('.zip'):
        file_path= os.path.join(vendome_folder,'indesign.zip')
        indesign.save(file_path)

        # Décompresser le fichier ZIP
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(vendome_folder)
        

       
        folder_path = os.path.join(vendome_folder,'indesign')

        main_vendome(folder_path+'/','templates/',vendome_folder)

        return 'Vendôme ajouté avec succès avec les fichiers InDesign'
    
    else:
        return 'Venôme ajouté avec succès sans les fichiers InDesign'

