// Page statique (portail public) avec un bouton pour acceder a /direction

import { useNavigate } from "react-router-dom";

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Bienvenue</h1>
      <button onClick={() => navigate("/direction")}>Aller à l'application</button>
    </div>
  );
}