// pages/Direction.jsx
// Vérifie si l'utilisateur est connecté. Si oui, redirection vers /app.
// Sinon, affiche un formulaire de connexion.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormulaireConnexion from "../components/FormulaireConnexion";
import { estAuthentifie } from "../api/api_global";

export default function Direction() {
  const navigate = useNavigate();
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    estAuthentifie().then((auth) => {
      if (auth) navigate("/app");
      else setFormVisible(true);
    });
  }, [navigate]);

  return formVisible ? <FormulaireConnexion /> : <p>Vérification en cours...</p>;
}

