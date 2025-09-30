// Page statique (portail public) avec un bouton pour acceder a /direction
import "../assets/styles/accueil.css"

import { useNavigate } from "react-router-dom";

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <div className="accueil-main-container">
      <h1>Bienvenue sur le nouveau portail des élèves</h1>
      <button onClick={() => navigate("/direction")}>Aller à l'application</button>
    </div>
  );
}