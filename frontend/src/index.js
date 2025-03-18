// src/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Login from './components/Login';

const root = ReactDOM.createRoot(document.getElementById('root'));



function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // État pour stocker la connexion

  // Vérifie l'état de l'utilisateur au chargement
  useEffect(() => {
    fetch('http://127.0.0.1:5000/est_auth', {
      method: 'GET',
      //credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setIsAuthenticated(data.etat_connexion);  // Mise à jour de l'état d'authentification
      })
      .catch(() => {
        setIsAuthenticated(false);  // En cas d'erreur, considère que l'utilisateur n'est pas connecté
      });
  }, []);

  if (isAuthenticated === null) {
    return <p>Chargement...</p>;  // Affichage en attente du résultat
  }

  return isAuthenticated ? <App /> : <Login />;
}

root.render(<Index />);
