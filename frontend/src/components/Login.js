// src/components/Login.js
import React, { useState } from "react";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState(""); // Stocke le nom d'utilisateur
  const [password, setPassword] = useState(""); // Stocke le mot de passe
  const [error, setError] = useState(""); // Stocke un message d'erreur si la connexion échoue

  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    fetch("http://127.0.0.1:5000/connexion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // Envoie les données en JSON
      credentials: "include", // Permet d'inclure les cookies si nécessaire
    })
      .then((response) => response.json()) // Convertit la réponse en JSON
      .then((data) => {
        if (data.connecte) {
          onLoginSuccess(); // Redirige vers App.js si connexion réussie
        } else {
          setError("Identifiants incorrects."); // Affiche un message d'erreur
        }
      })
      //.catch(() => setError("Erreur de connexion au serveur.")); // Gestion des erreurs réseau
  };

  return (
    <div>
      <h2>Connexion</h2>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Affiche l'erreur si elle existe */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Met à jour l'état
          required
        />
        <br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Met à jour l'état
          required
        />
        <br />
        <button type="submit">Se connecter</button> {/* Bouton de connexion */}
      </form>
    </div>
  );
}

export default Login;
