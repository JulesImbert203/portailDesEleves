// src/App.js
import React from 'react';
import { LayoutProvider } from "./layouts/Layout";
import Home from "./components/pages/Home";

function App() {
  const handleLogout = () => {
    fetch('http://127.0.0.1:5000/deconnexion', {
      method: 'POST',
      //credentials: 'include',
    })
      .then(response => {
        if (response.ok) {
          // Redirige vers la page de connexion
          window.location.reload();  // Recharge la page pour revenir à l'état de connexion
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la déconnexion :', error);
      });
  };
  return (
    <LayoutProvider defaultComponent={<Home />} /> 
  );
}

export default App;