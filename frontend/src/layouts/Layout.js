// src/layouts/Layout.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import Header from '../components/blocs/Header';  // Import du Header
import BlocSondage from '../components/blocs/blocSondage';  // Bloc de sondage
import '../assets/styles/layout.css';  // Import du CSS global du layout
import { seDeconnecter, obtenirIdUser, obtenirDataUser } from '../api';
import { useNavigate } from 'react-router-dom';

const LayoutContext = createContext();


export function LayoutProvider({ children, defaultComponent }) {
  const [currentComponent, setCurrentComponent] = useState(defaultComponent); // Home sera affiché par défaut
  const [userData, setUserData] = useState(null); // Stocker les infos utilisateur
  const [reloadSondage, setReloadSondage] = useState(false); // État pour forcer le rechargement

  const reloadBlocSondage = () => {
    setReloadSondage(prev => !prev); // Toggle l'état pour forcer le re-render
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const id = await obtenirIdUser();
        if (id) {
          const data = await obtenirDataUser(id);
          setUserData(data); // Stocker toutes les infos utilisateur
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur", error);
      }
    }
    fetchUserData();
  }, []);
  return (
    <LayoutContext.Provider value={{ currentComponent, setCurrentComponent, userData, reloadBlocSondage }}>
      <Layout reloadSondage={reloadSondage} />
      {children}
    </LayoutContext.Provider>
  );
}

function Layout({ reloadSondage  }) {
  const { currentComponent, userData } = useContext(LayoutContext);

  const navigate = useNavigate();
  // Fonction de déconnexion
    async function handleLogout() {
        await seDeconnecter();
        navigate("/direction");  // Rediriger après déconnexion
    }
  

  return (
    <div className="layout">
      <Header className="header-global" />
      <div className="main-content-global">
        <div className="sidebar-global left">
          <BlocSondage reloadSondage={reloadSondage} />
        </div>
        <div className="content-global">
          {currentComponent}
        </div>
        <div className="sidebar-global right">
          <div id="blocUtilisateur" className="bloc-global">
            <h3>Bienvenue {userData ? userData.nom_utilisateur : "Chargement..."} !</h3>
            <button onClick={() => handleLogout()} className="bloc-global-button">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}


export function useLayout() {
  return useContext(LayoutContext);
}

export default Layout;