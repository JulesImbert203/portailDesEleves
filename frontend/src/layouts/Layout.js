// src/layouts/Layout.js
import { createContext, useState, useContext, useEffect, useRef } from 'react';
import Header from '../components/blocs/Header';  // Import du Header
import BlocSondage from '../components/blocs/blocSondage';  // Bloc de sondage
import BlocChat from '../components/blocs/blocChat';
import BlocAnniversaire from '../components/blocs/blocAnniversaire';
import '../assets/styles/layout.css';  // Import du CSS global du layout
import { obtenirIdUser, estAuthentifie } from '../api/api_global';
import { obtenirDataUser } from '../api/api_utilisateurs';
import { Outlet } from 'react-router-dom';
import FormulaireConnexion from '../components/FormulaireConnexion';

const LayoutContext = createContext();

export function LayoutProvider() {
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

  const [estCo, setEstCo] = useState(false);

  useEffect(() => {
    estAuthentifie().then((auth) => {
      if (auth) setEstCo(false);
    });
  }, []);

  return (
    estCo ?
      <FormulaireConnexion /> :
      <LayoutContext.Provider value={{ userData, reloadBlocSondage }}>
        {userData &&
          <div className="layout">
            <Header className="header-global" />
            <div className="main-content-global">
              <div className="sidebar-global left">
                <BlocSondage reloadSondage={reloadSondage} />
              </div>
              <div className="content-global">
                <Outlet />
              </div>
              <div className="sidebar-global right">
                <div className="bloc-global" style={{ height: "30vh" }}>
                  <BlocChat />
                </div>
                <div className="bloc-global">
                  <BlocAnniversaire />
                </div>
              </div>
            </div>
          </div>}
      </LayoutContext.Provider>
  );
}


export function useLayout() {
  return useContext(LayoutContext);
}
