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

export default function Header() {
  const { userData } = useLayout();
  const navigate = useNavigate();

  async function handleLogout() {
    await seDeconnecter();
    navigate("/direction");  // Rediriger après déconnexion
  }

  return (
    <div className="global-header-header">
      {/* Menu déroulant */}
      <div className="global-header-dropdown">
        <button className="global-header-dropdown-btn">Menu</button>
        <div className="global-header-menu">
          <button onClick={() => navigate("/")}>Accueil</button>
          <button onClick={() => navigate("/assos")}>Assos</button>
          <button onClick={() => navigate("/assos/planning")}>Planning associatif</button>
          <button onClick={() => navigate("/trombi")}>Trombinoscope</button>
        </div>
      </div>

      {/* Titre centré */}
      <div className="global-header-centered-container">
        <h1
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}>Portail des élèves</h1>
      </div>

      <div className="global-header-dropdown">
        <button className="global-header-dropdown-btn">{userData ? userData.nom_utilisateur : "Chargement..."}</button>
        <div className="global-header-menu">
          <button onClick={() => handleLogout()} className="bloc-global-button">Se déconnecter</button>
          <button onClick={() => navigate(`utilisateur/${userData.id}`)} className="bloc-global-button">Ma page</button>
        </div>
      </div>
    </div>

  );
};
