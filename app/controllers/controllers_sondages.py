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
        question_du_jour, reponses, votes_par_question = resultat
        # Creer un dictionnaire pour les réponses et leurs votes
        reponses_et_votes = {}
        for i in range(len(reponses)):
            reponses_et_votes[reponses[i]] = votes_par_question[i]

        # Retourner les données sous forme de JSON
        return jsonify({
            'question': question_du_jour,
            'reponses': reponses_et_votes
        })
    else:
        return jsonify({'message': 'Il n\'y a pas de sondage aujourd\'hui.'}), 200

# /!\ ajouter un decorateur pour verifier qu'il y a bien un sodage aujourd'hui   
@controllers_sondages.route('/voter/<int:vote>', methods=['POST'])
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
@controllers_sondages.route('/valider_sondage/<int:id_sondage>', methods=['POST'])
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
    
@controllers_sondages.route('/proposer_sondage', methods=['GET', 'POST'])
@login_required
def proposer_un_sondage():
    """
    Permet a un utilisateur de proposer un sondage avec entre 2 et 4 reponses.
    Sera utilise en paralle d'un formulaire en html pour proposer. 
    """
    if request.method == 'POST':
        # Recuperation des donnees envoyees via le formulaire
        question = request.form.get('question')
        reponse1 = request.form.get('reponse1')
        reponse2 = request.form.get('reponse2')
        reponse3 = request.form.get('reponse3', None)
        reponse4 = request.form.get('reponse4', None)
        # Validation des reponses
        reponses = [reponse1, reponse2, reponse3, reponse4]
        reponses = [r for r in reponses if r is not None]

        if len(reponses) < 2 or len(reponses) > 4:
            return jsonify({'message': 'Le sondage doit avoir entre 2 et 4 réponses possibles.'}), 400
        try:
            proposer_sondage(question, reponses, current_user)
            return jsonify({'message': 'Sondage proposé avec succès.'}), 200
        except Exception as e:
            return jsonify({'message': f'Erreur lors de la proposition du sondage : {str(e)}'}), 500

    # Si c'est une requête GET, afficher le formulaire de proposition de sondage
    return render_template('proposer_sondage.html')
    # code a modifier en fonction de la logique des views
    

# sera execute automatiquement chaque jour a minuit
@controllers_sondages.route("/sondage_suivant", methods=["POST"])
def route_sondage_suivant() :
    try :
        sondage_suivant()
    except Exception as e:
        return jsonify({'message': f'Erreur lors du passage au sondage suivant : {str(e)}'}), 500
