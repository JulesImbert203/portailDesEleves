import "../assets/styles/formulaire_connexion.css"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { seConnecter } from "../api/api_global";

export default function FormulaireConnexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await seConnecter(username, password);
    
    if (success) {
      navigate("/"); // Redirige si connexion réussie
    } else {
      setErreur("Identifiants incorrects");
    }
  }

  return (
    <div className="connexion-main-container">
      <h2>Connexion</h2>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}
      <form onSubmit={handleSubmit} className="connexion-form">
        <label for="norm">Nom d'utilisateur</label>
        <input
          name="nom"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label for="mdp">Mot de passe</label>
        <input
          name="mdp"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
