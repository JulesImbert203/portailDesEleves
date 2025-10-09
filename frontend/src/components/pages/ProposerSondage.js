import React, { useState } from "react";
import { requeteProposerSondage } from './../../api/api_sondages';  // Importation de la fonction proposerSondage
import '../../assets/styles/proposer_sondage.css';  // Import du CSS global du layout
import { useNavigate } from "react-router-dom";

function ProposerSondage() {
  const navigate = useNavigate();

  // États pour la question et les réponses
  const [question, setQuestion] = useState("");
  const [reponses, setReponses] = useState(["", ""]);
  const [message, setMessage] = useState(""); // État pour le message de succès ou erreur

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifie qu'il y a entre 2 et 4 réponses
    if (reponses.length < 2 || reponses.length > 4) {
      setMessage("Il faut entre 2 et 4 réponses.");
      return;
    }

    // Appel de la fonction proposerSondage du fichier api.js pour soumettre les données
    const data = await requeteProposerSondage(question, reponses);
    if (data.etat) {
        setMessage("Sondage soumis avec succès!");
        
        // Réinitialiser les champs du formulaire après soumission réussie
        setQuestion("");
        setReponses(["", ""]);
      } else {
        setMessage(data.message);
      }
  };

  // Fonction pour ajouter une réponse
  const addReponse = () => {
    if (reponses.length < 4) {
      setReponses([...reponses, ""]);
    }
  };
  // Fonction pour supprimer une réponse
  const removeReponse = (index) => {
    if (reponses.length > 2) { // On peut seulement supprimer si il y a plus de 2 réponses
      const updatedReponses = reponses.filter((_, i) => i !== index);
      setReponses(updatedReponses);
    }
  };

  // Fonction pour modifier une réponse
  const handleReponseChange = (index, value) => {
    const updatedReponses = [...reponses];
    updatedReponses[index] = value;
    setReponses(updatedReponses);
  };

  return (
    <div className="proposer_sondage_container">
      <h1 className="proposer_sondage_title">Proposer un sondage</h1>
      <form onSubmit={handleSubmit} className="proposer_sondage_form">
        <div className="proposer_sondage_field">
          <label htmlFor="question">Question :</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="proposer_sondage_input"
          />
        </div>

        <div className="proposer_sondage_field">
          <label>Réponses :</label>
          {reponses.map((reponse, index) => (
            <div key={index} className="proposer_sondage_reponse_group">
              <input
                type="text"
                value={reponse}
                onChange={(e) => handleReponseChange(index, e.target.value)}
                required
                className="proposer_sondage_input"
              />
              {reponses.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeReponse(index)}
                  className="proposer_sondage_button"
                  title="Retirer"
                >
                  <img src="/assets/icons/delete.svg" alt="Bouton en forme de poubelle"/>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addReponse}
            className="proposer_sondage_button"
            title="Ajouter une réponse"
          >
            <img src="/assets/icons/plus.svg" alt="Bouton en forme de plus"/> 
          </button>
        </div>

        <button type="submit" className="proposer_sondage_submit">
          Soumettre
        </button>
      </form>

      {message && (
        <div className="proposer_sondage_message">
          <p>{message}</p>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="proposer_sondage_retour"
      >
        Retour
      </button>
    </div>

  );
}

export default ProposerSondage;
