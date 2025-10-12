import "../assets/styles/formulaire_connexion.scss"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { seConnecter } from "../api/api_global";
import { Container, Form, Button, Alert } from "react-bootstrap";

export default function FormulaireConnexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await seConnecter(username, password);
    
    if (success) {
      navigate("/home"); // Redirige si connexion réussie
    } else {
      setErreur("Identifiants incorrects");
    }
  }

  return (
    <Container className="connexion-main-container d-flex flex-column align-items-center justify-content-center vh-100">
      <h2 className="m-4">Connexion</h2>
      {erreur && <Alert variant="danger">{erreur}</Alert>}
      <Form onSubmit={handleSubmit} className="connexion-form border rounded p-4 d-flex flex-column">
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Nom d'utilisateur</Form.Label>
          <Form.Control type="text" placeholder="Entrer le nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Mot de passe</Form.Label>
          <Form.Control type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Se connecter
        </Button>
      </Form>
    </Container>
  );
}
