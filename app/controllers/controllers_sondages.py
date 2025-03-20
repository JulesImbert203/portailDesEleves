from flask import Blueprint, request, jsonify, render_template
from flask_login import login_required, current_user

from app.services import *
from app.utils.decorators import * 
from app.services.services_sondages import *


# Creer le blueprint pour les sondages
controllers_sondages = Blueprint('controllers_sondages', __name__)

@controllers_sondages.route('/sondage_du_jour', methods=['GET'])
@login_required
def route_sondage_du_jour():
    """
    Recupere les informations sur le sondage du jour : question, reponses et votes.
    """
    resultat = obtenir_sondage_du_jour_et_votes()
    if resultat:
        question_du_jour, reponses_brutes, votes_par_question = resultat
        reponses = []
        votes = []
        for i in range(4) :
            if reponses_brutes[i] != None :
                reponses.append(reponses_brutes[i])
                votes.append(votes_par_question[i])
        
        # Retourner les données sous forme de JSON
        return jsonify({
            'is_sondage': True,
            'question': question_du_jour, # quel est le meilleur etage ?
            'reponses': reponses, #["piche", "straal", "bench"]
            'votes' : votes # [0,1,8]
        })
    else:
        return jsonify({'is_sondage': False}), 200

# /!\ ajouter un decorateur pour verifier qu'il y a bien un sodage aujourd'hui   
@controllers_sondages.route('/route_voter_sondage/<int:vote>', methods=['POST'])
@login_required
def route_voter_sondage(vote:int):
    """
    Permet a un utilisateur de voter pour une reponse dans le sondage du jour.
    """
    try :
        creer_vote_sondage_du_jour(current_user, vote)
        return jsonify({'message': 'Vote enregistré avec succès'}), 200
    except ErreurSondage as e:
        return jsonify({'message': str(e)}), 500
    
# /!\ ajouter un decorateur pour verifier que seul le vp sondaj peut faire ça
@controllers_sondages.route('/route_valider_sondage/<int:id_sondage>', methods=['POST'])
@login_required
def route_valider_sondage(id_sondage:int):
    """
    Permet a un vp sondaj de valider un sondage propose.
    """
    try :
        valider_sondage(id_sondage)
        return jsonify({'message': 'Sondage validé avec succès'}), 200
    except ErreurSondage as e:
        return jsonify({'message': str(e)}), 500

@controllers_sondages.route('/route_supprimer_sondage/<int:id_sondage>', methods=['POST'])
@login_required
def route_supprimer_sondage(id_sondage:int):
    """
    Permet a un vp sondaj de supprimer un sondage propose.
    """
    try :
        supprimer_sondage(id_sondage)
        return jsonify({'message': 'Sondage supprimé avec succès'}), 200
    except ErreurSondage as e:
        return jsonify({'message': str(e)}), 500


@controllers_sondages.route('/route_proposer_sondage', methods=['POST'])
@login_required
def route_proposer_sondage():
    """
    Permet de proposer un sondage depuis le form React
    """
    data = request.get_json()  # Récupère les données JSON envoyées par React
    question = data.get('question')
    reponses = data.get('reponses')
    # Si question ou réponses manquantes, retour d'erreur
    if not question or not reponses or len(reponses) < 2 or len(reponses) > 4:
        return jsonify({"message": "Erreur : La question doit avoir entre 2 et 4 réponses."}), 400

    # Appel de la fonction proposer_sondage pour enregistrer le sondage dans la base de données
    try:
        proposer_sondage(question, list(reponses), current_user)  # Appel de la fonction de service
        return jsonify({"etat": True, "message": "Sondage créé avec succès!"}), 201
    except Exception as e:
        return jsonify({"etat": False, "message": f"Erreur lors de la création du sondage: {str(e)}"}), 500

# sera execute automatiquement chaque jour a minuit
@controllers_sondages.route("/sondage_suivant", methods=["POST"])
def route_sondage_suivant() :
    try :
        sondage_suivant()
        return jsonify({"message" : "success"}), 200
    except Exception as e:
        return jsonify({'message': f'Erreur lors du passage au sondage suivant : {str(e)}'}), 500

@controllers_sondages.route("/route_obtenir_sondages_en_attente", methods=["GET"])
def route_obtenir_sondages_en_attente() :
    try :
        sondages = obtenir_sondages_non_valide()
        return jsonify({"sondages": sondages}), 200

    except Exception as e:
        return jsonify({'message': f'Erreur lors du chargement des sondages : {str(e)}'}), 500
