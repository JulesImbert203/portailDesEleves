import React, { useState } from "react";
import { requeteProposerSondage } from './../../api/api_sondages';  // Importation de la fonction proposerSondage
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, InputGroup, Alert } from "react-bootstrap";

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
    <Container className="mt-4">
      <h1>Proposer un sondage</h1>
      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>Question</Form.Label>
          <Form.Control
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Réponses</Form.Label>
          {reponses.map((reponse, index) => (
            <InputGroup className="mb-2" key={index}>
              <Form.Control
                type="text"
                value={reponse}
                onChange={(e) => handleReponseChange(index, e.target.value)}
                required
              />
              {reponses.length > 2 && (
                <Button variant="outline-danger" onClick={() => removeReponse(index)}>
                  <img src="/assets/icons/delete.svg" alt="Supprimer" />
                </Button>
              )}
            </InputGroup>
          ))}
          {reponses.length < 4 && (
            <Button variant="outline-primary" onClick={addReponse}>
                <img src="/assets/icons/plus.svg" alt="Ajouter" />
            </Button>
          )}
        </Form.Group>

        <Button variant="primary" type="submit">
          Soumettre
        </Button>
      </Form>

      {message && (
        <Alert variant={message.includes("succès") ? "success" : "danger"} className="mt-3">
          {message}
        </Alert>
      )}

      <Button variant="link" onClick={() => navigate("/")} className="mt-3">
        Retour
      </Button>
    </Container>

  );
}

export default ProposerSondage;
