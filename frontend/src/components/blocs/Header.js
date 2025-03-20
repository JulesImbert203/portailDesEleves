// src/components/blocs/Header.js
import React, { useState } from "react";
import '../../assets/styles/header.css';
import {useLayout} from '../../layouts/Layout'; 

const Header = () => {
    const [activeTab, setActiveTab] = useState(null);

    const handleTabClick = (tab) => {
        setActiveTab(tab);  // Change l'onglet actif lorsqu'on clique
    };

    return (
        <div className="header">
            
            
            {/* Menu déroulant */}
            <div className="dropdown">
                <button className="dropdown-btn">Menu</button>
                <div className="menu">
                    <button onClick={() => handleTabClick("home")}>
                        Accueil
                    </button>
                    <button onClick={() => handleTabClick("about")}>
                        À propos
                    </button>
                    <button onClick={() => handleTabClick("contact")}>
                        Contact
                    </button>
                    <button onClick={() => handleTabClick("services")}>
                        Services
                    </button>
                </div>
            </div>
            <div class="centered-container">
              <h1 class='centered-container'>Portail des élèves</h1>
            </div>

            
        </div>
    );
};

export default Header;