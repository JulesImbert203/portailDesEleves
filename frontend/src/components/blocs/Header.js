// src/components/blocs/Header.js
import { useNavigate } from 'react-router-dom';

import '../../assets/styles/header.css';
import { useLayout } from '../../layouts/Layout';
import Home from '../pages/Home';
import ListeAssos from "../pages/ListeAssos";
import PlanningAsso from "../pages/PlanningAsso";
import Trombi from "../pages/Trombi";
import PageUtilisateur from "../pages/PageUtilisateur";

import { seDeconnecter } from '../../api/api_global';
import { verifierSuperutilisateur } from '../../api/api_utilisateurs';
import { useEffect, useState } from 'react';
import { verifierPermission } from '../../api/api_soifguard';

export default function Header() {
  const { setCurrentComponent, userData } = useLayout();
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function checkSuperUser() {
      const result = await verifierSuperutilisateur();
      setIsSuperUser(result.is_superuser);
    }
    checkSuperUser();

    async function checkPermissions() {
      const octoPermission = await verifierPermission("octo");
      const bieroPermission = await verifierPermission("biero");

      if (octoPermission || bieroPermission) {
        setHasPermission(true);
      }
    }
    checkPermissions()
  }, []);

  async function handleLogout() {
    await seDeconnecter();
    navigate("/direction");  // Rediriger après déconnexion
  }

  return (
    <div className="global-header-header">
      {/* Menu déroulant */}
      <div className="global-header-left-container">
        <div className="global-header-dropdown">
          <button className="global-header-dropdown-btn">Menu</button>
          <div className="global-header-menu">
            <button onClick={() => setCurrentComponent(<Home />)}>Accueil</button>
            <button onClick={() => setCurrentComponent(<ListeAssos />)}>Assos</button>
            <button onClick={() => setCurrentComponent(<PlanningAsso />)}>Planning associatif</button>
            <button onClick={() => setCurrentComponent(<Trombi />)}>Trombinoscope</button>
          </div>
        </div>
        {hasPermission && <button className="global-header-dropdown-btn" onClick={() => navigate("/soifguard")}>Soifguard</button>}
        {isSuperUser && <button className="global-header-dropdown-btn" onClick={() => navigate("/administration")}>Administration</button>}
      </div>

      {/* Titre centré */}
      <div className="global-header-centered-container">
        <h1
          onClick={() => setCurrentComponent(<Home />)}
          style={{ cursor: "pointer" }}>Portail des élèves</h1>
      </div>

      <div className="global-header-right-container">
        <div className="global-header-dropdown">
          <button className="global-header-dropdown-btn">{userData ? userData.nom_utilisateur : "Chargement..."}</button>
          <div className="global-header-menu" style={{right : 0}}>
            <button onClick={() => handleLogout()} className="bloc-global-button">Se déconnecter</button>
            <button onClick={() => setCurrentComponent(<PageUtilisateur id={userData.id} />)} className="bloc-global-button">Ma page</button>
          </div>
        </div>
      </div>
    </div>

  );
};
