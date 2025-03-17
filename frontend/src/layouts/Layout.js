// src/layouts/Layout.js
import React from 'react';
import Header from '../components/blocs/Header';  // Import du Header
import BlocSondage from '../components/blocs/blocSondage';  // Bloc de sondage
import BlocUtilisateur from '../components/blocs/blocUtilisateur';  // Bloc d'utilisateur
import '../assets/styles/layout.css';  // Import du CSS global du layout

function Layout({ children }) {
  return (
    <div className="layout">
      <Header /> {/* Affichage de l'en-tête */}
      <div className="main-content">
        <div className="sidebar left">
          <BlocSondage /> {/* Bloc de sondages */}
        </div>
        <div className="content">
          {children} {/* Affichage du contenu spécifique à chaque page */}
        </div>
        <div className="sidebar right">
          <BlocUtilisateur /> {/* Bloc d'utilisateurs */}
        </div>
      </div>
    </div>
  );
}

export default Layout;
