import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { seConnecter } from "../api/baz";

export default function FormulaireConnexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await seConnecter(username, password);
    
    if (success) {
      navigate("/app"); // Redirige si connexion réussie
    } else {
      setErreur("Identifiants incorrects");
    }
  }

  return (
    <div>
      <h2>Connexion</h2>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
