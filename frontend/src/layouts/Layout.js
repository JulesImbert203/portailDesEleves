// src/layouts/Layout.js
import React, { createContext, useState, useContext } from 'react';
import Header from '../components/blocs/Header';  // Import du Header
import BlocSondage from '../components/blocs/blocSondage';  // Bloc de sondage
import '../assets/styles/layout.css';  // Import du CSS global du layout
import { seDeconnecter } from '../api';
import { useNavigate } from 'react-router-dom';

const LayoutContext = createContext();


export function LayoutProvider({ children, defaultComponent }) {
  const [currentComponent, setCurrentComponent] = useState(defaultComponent); // Home sera affiché par défaut

  return (
    <LayoutContext.Provider value={{ currentComponent, setCurrentComponent }}>
      <Layout />
      {children}
    </LayoutContext.Provider>
  );
}

function Layout() {
  const { currentComponent } = useContext(LayoutContext);

  const navigate = useNavigate();
  // Fonction de déconnexion
    async function handleLogout() {
        await seDeconnecter();
        navigate("/direction");  // Rediriger après déconnexion
    }

  return (
    <div className="layout">
      <Header />
      <div className="main-content">
        <div className="sidebar left">
          <BlocSondage />
        </div>
        <div className="content">
          {currentComponent} 
        </div>
        <div className="sidebar right">
          <h3>Bienvenue !</h3>
          <button onClick={() => handleLogout()}>
                  Se déconnecter
            </button>
        </div>
      </div>
    </div>
  );
}


export function useLayout() {
  return useContext(LayoutContext);
}

export default Layout;