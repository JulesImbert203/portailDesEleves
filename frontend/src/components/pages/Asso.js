import React, { useEffect, useState } from 'react';
import '../../assets/styles/asso.css'; 
import { useLayout } from '../../layouts/Layout';
import { chargerAsso, estUtilisateurDansAsso } from './../../api'; 

function Asso({ id }) {
    const [asso, setAsso] = useState(null);
    const [isMembreDansAsso, setIsMembreDansAsso] = useState(null);
    const [isMembreAutorise, setIsMembreAutorise] = useState(null);

    const [activeTab, setActiveTab] = useState("info");
    const { setCurrentComponent } = useLayout();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const assoData = await chargerAsso(id);
                const membreData = await estUtilisateurDansAsso(id);
                setAsso(assoData);
                setIsMembreDansAsso(membreData.is_membre);
                setIsMembreAutorise(membreData.autorise)
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [id]);
    
    
    if (asso===null || isMembreDansAsso===null) return <p>Chargement...</p>;

     return (
        <div className="asso-container">
        <h2>{asso.nom}</h2>
        <img src={`http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.img}`} alt={asso.nom} />

        {/* Onglets */}
        <div className="tabs-container">
            <div className={`tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
                <i className="fas fa-info-circle"></i> Infos
            </div>

            <div className='asso-infos-principales'>
                <h2 className='asso-nom'>{asso.nom}</h2>
                {/* Administration de l'asso */}
                {isMembreAutorise && 
                <div className='asso-admin'>
                    { isMembreDansAsso && <div className='badge_est_dans_asso'><p>Vous êtes dans l'asso</p></div>}
                    <button className='button_asso' id="button_asso_gerer_membres">Gerer Membres</button>
                    <button className='button_asso' id="button_asso_gerer_evenements">Gerer Événements</button>
                    <button className='button_asso' id="button_asso_gerer_publications">Gerer Publications</button>
                </div>}
            </div>
            

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
        </div>
        
    )
};

export default Asso;
