from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app.services import db
from app.models import Utilisateur, Conso
from app.services.services_soifguard import *
from app.services.services_global import *
from app.utils.decorators import * 

# Creer le blueprint pour soifguard
controllers_soifguard = Blueprint('controllers_soifguard', __name__)

@controllers_soifguard.route('/get_permissions_soifguard', methods=['GET'])
@login_required
@superutilisateur_required
def get_permissions_soifguard():
    # Récupérer toutes les permissions
    permissions = PermissionSoifguard.query.all()
    # Créer un dictionnaire pour regrouper les utilisateurs par id
    utilisateurs_permissions = {}
    for permission in permissions:
        utilisateur = Utilisateur.query.get(permission.id_utilisateur)
        if utilisateur:
            if utilisateur.id not in utilisateurs_permissions:
                utilisateurs_permissions[utilisateur.id] = {
                    'nom_utilisateur': utilisateur.nom_utilisateur,
                    'assos': set()  # Utilisation d'un set pour éviter les doublons
                }
            # Ajouter l'association ('octo', 'biero') à l'utilisateur
            utilisateurs_permissions[utilisateur.id]['assos'].add(permission.asso)
    # Structurer la réponse
    result = []
    for user_id, data in utilisateurs_permissions.items():
        assos = ', '.join(data['assos'])  # Convertir le set en chaîne de caractères
        result.append({
            'nom_utilisateur': data['nom_utilisateur'],
            'assos': assos
        })
    return jsonify(result)

@controllers_soifguard.route('/ajouter_permission', methods=['POST'])
@login_required
@superutilisateur_required
def ajouter_permission():
    """
    Ajoute une permission Soifguard pour un utilisateur.
    """
    data = request.json
    id_utilisateur = int(data.get("id_utilisateur"))
    asso = data.get("asso", "octo")  # Par défaut, "octo"
    if not id_utilisateur:
        return jsonify({"success": False, "message": "ID utilisateur requis"}), 400
    if asso not in ["octo", "biero"]:
        return jsonify({"success": False, "message": "Association invalide"}), 400
    # Vérifie si l'utilisateur a déjà la permission
    permission_existante = PermissionSoifguard.query.filter_by(id_utilisateur=id_utilisateur, asso=asso).first()
    if permission_existante:
        return jsonify({"success": False, "message": "L'utilisateur a déjà cette permission"}), 400
    # Ajoute la permission
    nouvelle_permission = PermissionSoifguard(id_utilisateur=id_utilisateur, asso=asso)
    db.session.add(nouvelle_permission)
    db.session.commit()
    return jsonify({"success": True, "message": f"Permission '{asso}' ajoutée à l'utilisateur {id_utilisateur}."})

@controllers_soifguard.route('/encaisser_octo', methods=['POST'])
@login_required
@a_permission_soifguard_octo
def encaisser_octo():
    data = request.json
    utilisateur = Utilisateur.query.get(data['id_utilisateur'])
    conso = Conso.query.get(data['id_conso'])
    if not utilisateur or not conso:
        return jsonify({"success": False, "message": "Utilisateur ou conso introuvable"}), 404
    if conso.asso != 'octo':
        return jsonify({"success": False, "message": "Cette conso n'est pas gérée par l'octo"}), 403
    etat, message, prix_encaisse, asso = encaisser_utilisateur(utilisateur, conso)
    return jsonify({"success": etat, "message": message, "prix_encaisse": prix_encaisse, "asso": asso})

@controllers_soifguard.route('/encaisser_biero', methods=['POST'])
@login_required
@a_permission_soifguard_biero
def encaisser_biero():
    data = request.json
    utilisateur = Utilisateur.query.get(data['id_utilisateur'])
    conso = Conso.query.get(data['id_conso'])
    if not utilisateur or not conso:
        return jsonify({"success": False, "message": "Utilisateur ou conso introuvable"}), 404
    if conso.asso != 'biero':
        return jsonify({"success": False, "message": "Cette conso n'est pas gérée par la biero"}), 403
    etat, message, prix_encaisse, asso = encaisser_utilisateur(utilisateur, conso)
    return jsonify({"success": etat, "message": message, "prix_encaisse": prix_encaisse, "asso": asso})

@controllers_soifguard.route('/crediter_octo', methods=['POST'])
@login_required
@a_permission_soifguard_octo
def crediter_octo():
    data = request.json
    utilisateur = Utilisateur.query.get(data['id_utilisateur'])
    if not utilisateur:
        return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
    message = crediter_utilisateur(utilisateur, data['somme'], 'octo')
    db.session.commit()
    return jsonify({"success": True, "message": message})

@controllers_soifguard.route('/crediter_biero', methods=['POST'])
@login_required
@a_permission_soifguard_biero
def crediter_biero():
    data = request.json
    utilisateur = Utilisateur.query.get(data['id_utilisateur'])
    if not utilisateur:
        return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
    message = crediter_utilisateur(utilisateur, data['somme'], 'biero')
    db.session.commit()
    return jsonify({"success": True, "message": message})

@controllers_soifguard.route('/fixer_negatif_maximum_octo', methods=['POST'])
@login_required
@a_permission_soifguard_octo
def fixer_negatif_maximum_octo():
    data = request.json
    try:
        fixer_negatif_maximum('octo', data['maximum'])
        return jsonify({"success": True, "message": "Plafond de dette octo mis à jour"})
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400

@controllers_soifguard.route('/fixer_negatif_maximum_biero', methods=['POST'])
@login_required
@a_permission_soifguard_biero
def fixer_negatif_maximum_biero():
    data = request.json
    try:
        fixer_negatif_maximum('biero', data['maximum'])
        return jsonify({"success": True, "message": "Plafond de dette biero mis à jour"})
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400

@controllers_soifguard.route('/ajouter_conso_octo', methods=['POST'])
@login_required
@a_permission_soifguard_octo
def ajouter_conso_octo():
    data = request.json
    if data['asso'] != 'octo':
        return jsonify({"success": False, "message": "Cette conso n'est pas gérée par l'octo"}), 403
    ajouter_nouvelle_conso(data['nom_conso'], 'octo', data['prix'], data.get('prix_cotisant'))
    return jsonify({"success": True, "message": "Conso ajoutée avec succès pour l'octo"})

@controllers_soifguard.route('/ajouter_conso_biero', methods=['POST'])
@login_required
@a_permission_soifguard_biero
def ajouter_conso_biero():
    data = request.json
    if data['asso'] != 'biero':
        return jsonify({"success": False, "message": "Cette conso n'est pas gérée par la biero"}), 403
    ajouter_nouvelle_conso(data['nom_conso'], 'biero', data['prix'], data.get('prix_cotisant'))
    return jsonify({"success": True, "message": "Conso ajoutée avec succès pour la biero"})

@controllers_soifguard.route('/supprimer_conso_octo', methods=['DELETE'])
@login_required
@a_permission_soifguard_octo
def supprimer_conso_octo():
    data = request.json
    conso = Conso.query.get(data['id_conso'])
    if not conso or conso.asso != 'octo':
        return jsonify({"success": False, "message": "Conso introuvable ou non gérée par l'octo"}), 404
    supprimer_conso(conso)
    return jsonify({"success": True, "message": "Conso supprimée avec succès de l'octo"})

@controllers_soifguard.route('/supprimer_conso_biero', methods=['DELETE'])
@login_required
@a_permission_soifguard_biero
def supprimer_conso_biero():
    data = request.json
    conso = Conso.query.get(data['id_conso'])
    if not conso or conso.asso != 'biero':
        return jsonify({"success": False, "message": "Conso introuvable ou non gérée par la biero"}), 404
    supprimer_conso(conso)
    return jsonify({"success": True, "message": "Conso supprimée avec succès de la biero"})

@controllers_soifguard.route('/modifier_prix_conso_octo', methods=['PUT'])
@login_required
@a_permission_soifguard_octo
def modifier_prix_conso_octo():
    data = request.json
    conso = Conso.query.get(data['id_conso'])
    if not conso or conso.asso != 'octo':
        return jsonify({"success": False, "message": "Conso introuvable ou non gérée par l'octo"}), 404
    modifier_prix_conso(conso, data['nouveau_prix'], data.get('nouveau_prix_cotisant'))
    return jsonify({"success": True, "message": "Prix de la conso octo modifié avec succès"})

@controllers_soifguard.route('/modifier_prix_conso_biero', methods=['PUT'])
@login_required
@a_permission_soifguard_biero
def modifier_prix_conso_biero():
    data = request.json
    conso = Conso.query.get(data['id_conso'])
    if not conso or conso.asso != 'biero':
        return jsonify({"success": False, "message": "Conso introuvable ou non gérée par la biero"}), 404
    modifier_prix_conso(conso, data['nouveau_prix'], data.get('nouveau_prix_cotisant'))
    return jsonify({"success": True, "message": "Prix de la conso biero modifié avec succès"})

@controllers_soifguard.route('/liste_consos/<asso>', methods=['GET'])
@login_required
def liste_consos(asso):
    consos = liste_des_consos(asso)
    consos_json = [
        {"id": conso.id, "nom_conso": conso.nom_conso, "prix": conso.prix, "prix_cotisant": conso.prix_cotisant}
        for conso in consos
    ]
    return jsonify({"success": True, "consos": consos_json})

@controllers_soifguard.route("/verifier_permission", methods=["POST"])
@login_required
def verifier_permission():
    """Verifie si l'utilisateur a les permissions pour utiliser soifguard"""
    data = request.json
    asso = data.get("asso")
    if asso not in ["octo", "biero"]:
        return jsonify({"success": False, "message": "Association invalide"}), 400
    permission = PermissionSoifguard.query.filter_by(id_utilisateur=current_user.id, asso=asso).first()
    has_permission = permission is not None
    return jsonify({"success": True, "has_permission": has_permission}), 200

@controllers_soifguard.route('/switch_cotisation_octo/<int:id_utilisateur>', methods=['POST'])
@login_required
@a_permission_soifguard_octo
def switch_cotisation_octo(id_utilisateur:int) :
    """
    Rend cotisant un utilisateur non cotisant, et rend non cotisant un utilisateur cotisant
    Pour l'octo
    """
    utilisateur = db.session.get(Utilisateur, id_utilisateur)
    if utilisateur:
        if utilisateur.est_cotisant_octo :
            utilisateur.est_cotisant_octo = False
        else :
            utilisateur.est_cotisant_octo = True
        db.session.commit()
        return jsonify({"message":"cotisation mise à jour avec succes"}), 200
    else :
        return jsonify({"message":"utilisateur introuvable"}), 400
    
@controllers_soifguard.route('/switch_cotisation_biero/<int:id_utilisateur>', methods=['POST'])
@login_required
@a_permission_soifguard_biero
def switch_cotisation_biero(id_utilisateur:int) :
    """
    Rend cotisant un utilisateur non cotisant, et rend non cotisant un utilisateur cotisant
    Pour la biero
    """
    utilisateur = db.session.get(Utilisateur, id_utilisateur)
    if utilisateur:
        if utilisateur.est_cotisant_biero :
            utilisateur.est_cotisant_biero = False
        else :
            utilisateur.est_cotisant_biero = True
        db.session.commit()
        return jsonify({"message":"cotisation mise à jour avec succes"}), 200
    else :
        return jsonify({"message":"utilisateur introuvable"}), 400

@controllers_soifguard.route('/get_negatif_max/<string:asso>', methods=['GET'])
@login_required
def get_negatif_max(asso:str) :
    """
    Donne le neagtif maximal autorisé pour octo ou biero
    """
    if asso == 'octo' :
        return jsonify({"asso": asso, "max": get_global_var("max_negatif_octo")}), 200
    elif asso == 'biero' :
        return jsonify({"asso": asso, "max": get_global_var("max_negatif_biero")}), 200
    else :
        return jsonify({"message": "erreur : asso doit etre octo ou biero"}), 400

    
      
    
