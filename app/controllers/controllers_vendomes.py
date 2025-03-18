from flask import Blueprint, request, redirect, url_for,render_template
import os
from flask_login import login_required, current_user
import zipfile
from app.services import *
from app.utils.decorators import * 
from app.services.services_utilisateurs import *
from app.services.services_vendomes import main_vendome

# Creer le blueprint pour les utilisateurs
controllers_vendomes = Blueprint('controllers_vendomes', __name__)

UPLOAD_VENDOME_FOLDER= 'app/uploads/vendomes'
controllers_vendomes.config['UPLOAD_VENDOME_FOLDER'] = UPLOAD_VENDOME_FOLDER

@controllers_vendomes.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'Aucun fichier sélectionné'
    file = request.files['file']
    if file.filename == '':
        return 'Aucun fichier sélectionné'
    if file and file.filename.endswith('.zip'):
        file_path = os.path.join(controllers_vendomes.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Décompresser le fichier ZIP
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(controllers_vendomes.config['UPLOAD_FOLDER'])

        #Récupérer le nom dossier décompressé
        folder_name = file.filename.split('.zip')[0]
        folder_path = os.path.join(controllers_vendomes.config['UPLOAD_FOLDER'], folder_name)
        print(folder_path)
        main_vendome(folder_path+'/','templates/',folder_name)
        return 'Fichier téléversé et décompressé avec succès'
    return 'Fichier non valide'