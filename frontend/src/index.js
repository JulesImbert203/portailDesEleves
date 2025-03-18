// src/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById('root'));



function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // État pour stocker la connexion

  function Auth(){
    setIsAuthenticated(true);
  }

  useEffect(() => {
    fetch('http://127.0.0.1:5000/est_auth', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setIsAuthenticated(data.etat_connexion) ; // Maintenant isAuthentificated contient le booleen qui dit si l'utilisateur est connecte
      })
      .catch(error => {
        console.error("Erreur lors de la vérification :", error);
        setIsAuthenticated(false);
      });
  }, []);
  // Apres la requete, charge la page en fonction du resultat
  if (isAuthenticated === null) {
    return <p>Chargement...</p>; // Affichage en attente de la réponse
  }

  return isAuthenticated ? <App /> : <Login onLoginSuccess={Auth}/>;
}

root.render(<Index />);
