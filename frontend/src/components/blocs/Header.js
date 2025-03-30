// src/components/blocs/Header.js
import React, { useState } from "react";
import '../../assets/styles/header.css';
import {useLayout} from '../../layouts/Layout'; 
import Home from "../pages/Home";
import Liste_Assos from "../pages/ListeAssos";

const Header = () => {
    const [activeTab, setActiveTab] = useState(null);
    const {setCurrentComponent} = useLayout();

    const handleTabClick = (tab) => {
        setCurrentComponent(tab);  // Change l'onglet actif lorsqu'on clique
    };

    return (
        <div className="header">
            
            
            {/* Menu déroulant */}
            <div className="dropdown">
                <button className="dropdown-btn">Menu</button>
                <div className="menu">
                    <button onClick={() => handleTabClick(<Home />)}>
                        Accueil
                    </button>
                    <button onClick={() => handleTabClick(<Liste_Assos />)}>
                        Assos
                    </button>
                    
                </div>
            </div>
            <div class="centered-container">
              <h1>Portail des élèves</h1>
            </div>

            
        </div>
    );
};

export default Header;