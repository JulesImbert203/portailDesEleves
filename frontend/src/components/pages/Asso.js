import React, { useEffect, useState } from 'react';
import '../../assets/styles/asso.css'; 
import {useLayout} from '../../layouts/Layout'; 
import Home from './Home';
import ListeAssos from './ListeAssos';



function Asso({id}) {

    const [asso, setAsso] = useState([]);
    const [activeTab, setActiveTab] = useState("info");
    const { setCurrentComponent } = useLayout();
    
    
    useEffect(() => {
    fetch('http://localhost:5000/api/associations/'+String(id)) 
      .then((response) => response.json())
      .then((data) => setAsso(data))
      .catch((error) => console.error("Erreur de chargement des images:", error));
  }, []);
  
  
  

  return (
    <div className="asso-container">
        <h2>{asso.nom}</h2>
        <img src={`http://127.0.0.1:5000/upload/associations/${asso.img}`} alt={asso.nom} />

        {/* Onglets */}
        <div className="tabs-container">
            <div className={`tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
                <i className="fas fa-info-circle"></i> Infos
            </div>
            <div className={`tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
                <i className="fas fa-calendar-alt"></i> Événements
            </div>
            <div className={`tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
                <i className="fas fa-users"></i> Membres
            </div>
        </div>

        {/* Contenu des onglets */}
        <div className="tab-content">
            {activeTab === "info" && <p>{asso.description}</p>}
            {activeTab === "events" && <p>Liste des événements ici...</p>}
            {activeTab === "members" && <p>Liste des membres ici...</p>}
        </div>
    </div>
    );

}

export default Asso; 

