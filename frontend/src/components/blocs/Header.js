// src/components/blocs/Header.js
import React, { useState } from "react";
import '../../assets/styles/header.css';
import {useLayout} from '../../layouts/Layout'; 
import Home from '../pages/Home';
import Liste_Assos from "../pages/ListeAssos";
import PlanningAsso from "../pages/PlanningAsso";
import Trombi from "../pages/Trombi";
import PageUtilisateur from "../pages/PageUtilisateur";

const Header = () => {
    const { setCurrentComponent, userData } = useLayout();
    
    return (
        <div className="global-header-header">
            {/* Menu déroulant */}
            <div className="global-header-dropdown">
                <button className="global-header-dropdown-btn">Menu</button>
                <div className="global-header-menu">
                <button onClick={() => setCurrentComponent(<Home />)}>Accueil</button>
                <button onClick={() => setCurrentComponent(<Liste_Assos />)}>Assos</button>
                <button onClick={() =>setCurrentComponent(<PlanningAsso />)}>Planning associatif</button>
                <button onClick={() =>setCurrentComponent(<Trombi />)}>Trombinoscope</button>
                <button onClick={() =>setCurrentComponent(<PageUtilisateur id={userData.id} />)}>Ma page</button>
                </div>
            </div>

            {/* Titre centré */}
            <div className="global-header-centered-container">
                <h1>Portail des élèves</h1>
            </div>
        </div>

    );
};

export default Header;