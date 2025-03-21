import React, { useEffect, useState } from 'react';
import '../../assets/styles/asso.css'; 
import { useLayout } from '../../layouts/Layout';

function Asso({ id }) {
    const [asso, setAsso] = useState(null);
    const [activeTab, setActiveTab] = useState("info");
    const { setCurrentComponent } = useLayout();
    
    useEffect(() => {
        fetch(`http://localhost:5000/api/associations/${id}`)
            .then(response => response.json())
            .then(data => setAsso(data))
            .catch(error => console.error("Erreur de chargement de l'association:", error));
    }, [id]);
    
    if (!asso) return <p>Chargement...</p>;

    return (
        <div className="asso-container">
            {/* Bannière avec logo */}
            <div className="asso-banner" style={{ backgroundImage: `url(http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.banniere_path})` }}>
                <img className="asso-logo" src={`http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.img}`} alt={asso.nom} />
            </div>

            <h2 className='asso-nom'>{asso.nom}</h2>

            {/* Infos */}
            <div className="asso-info">
                
                <p>{asso.description}</p>
            </div>
            
            {/* Menu */}
            <div className="asso-tabs">
                <div className={`asso-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Infos</div>
                <div className={`asso-tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>Événements</div>
                <div className={`asso-tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>Membres</div>
                <div className={`asso-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>Publications</div>
            </div>
            
            {/* Contenu des onglets */}
            <div className="asso-tab-content">
                {activeTab === "info" && <p>{asso.description}</p>}
                {activeTab === "events" && <p>Liste des événements ici...</p>}
                {activeTab === "members" && <p>Liste des membres ici...</p>}
                {activeTab === "posts" && <p>Publications ici...</p>}
            </div>
        </div>
    );
}

export default Asso;
