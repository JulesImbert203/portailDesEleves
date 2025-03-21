// src/components/blocs/Header.js
import React, { useState } from "react";
import '../../assets/styles/header.css';
import {useLayout} from '../../layouts/Layout'; 
import Home from '../pages/Home';
import Liste_Assos from "../pages/ListeAssos";

const Header = () => {
    const [activeTab, setActiveTab] = useState(null);
    const { setCurrentComponent } = useLayout();
    const handleTabClick = (tab) => {
        setActiveTab(tab);  // Change l'onglet actif lorsqu'on clique
    };

    return (
        <div className="global-header-header">
            {/* Menu déroulant */}
            <div className="global-header-dropdown">
                <button className="global-header-dropdown-btn">Menu</button>
                <div className="global-header-menu">
                <button onClick={() => setCurrentComponent(<Home />)}>Accueil</button>
                <button onClick={() => setCurrentComponent(<Liste_Assos />)}>Assos</button>
                <button onClick={() => handleTabClick("contact")}>Contact</button>
                <button onClick={() => handleTabClick("services")}>Services</button>
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