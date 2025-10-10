// Page statique (portail public) avec un bouton pour acceder a /direction
import "../assets/styles/accueil.scss"

import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <Container className="accueil-main-container d-flex flex-column align-items-center justify-content-center vh-100">
      <h1>Bienvenue sur le nouveau portail des élèves</h1>
      <Button onClick={() => navigate("/direction")}>Aller à l'application</Button>
    </Container>
  );
}