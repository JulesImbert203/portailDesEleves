import React, { useState } from "react";
import { useLayout } from './../../layouts/Layout';  
import { requeteProposerSondage } from './../../api';  // Importation de la fonction proposerSondage
import Home from './Home';

function ProposerSondage() {
  const { setCurrentComponent } = useLayout();

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
    <div>
      <h1>Proposer un sondage</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="question">Question :</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Réponses :</label>
          {reponses.map((reponse, index) => (
            <div key={index}>
              <input
                type="text"
                value={reponse}
                onChange={(e) => handleReponseChange(index, e.target.value)}
                required
              />
              {reponses.length > 2 && (
                <button type="button" onClick={() => removeReponse(index)}>
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addReponse}>Ajouter une réponse</button>
        </div>

        <button type="submit">Soumettre le sondage</button>
      </form>
      {message && (
        <div>
          <p>{message}</p> {/* Affiche le message de succès ou d'erreur */}
        </div>
      )}
      <button onClick={() => setCurrentComponent(<Home />)}>
        Retour
      </button>
    </div>
  );
}

export default ProposerSondage;
