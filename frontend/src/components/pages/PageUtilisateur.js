import { useEffect, useState } from 'react';
import { obtenirDataUser } from '../../api/api_utilisateurs';
import '../../assets/styles/utilisateur.css';

import { useLayout } from '../../layouts/Layout';
import TabInfo from './PageUtilisateur/Info';
import TabAsso from './PageUtilisateur/Asso';
import TabQuestions from './PageUtilisateur/Question';
import { useParams, useResolvedPath } from 'react-router-dom';
import { verifierSuperutilisateur } from "../../api/api_utilisateurs";
import { BASE_URL } from '../../api/base';

function PageUtilisateur() {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState([]);
    const [activeTab, setActiveTab] = useState("info");
    const { userData } = useLayout();
    const [autoriseAModifier, setAutoriseAModifier] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const chargerUtilisateur = async () => {
            const data = await obtenirDataUser(id);
            setDonneesUtilisateur(data);
        };
        chargerUtilisateur();
        setAutoriseAModifier(userData.id == id || verifierSuperutilisateur().is_superuser);
    }, [id]);

    if (donneesUtilisateur === null) { return (<p>Chargement...</p>); }

    return (
        <div className="user-container">
            {/* Bannière avec photo de profil */}
            <div className="user-banner" style={{ backgroundImage: `url(${BASE_URL}/upload/utilisateurs/minesvert.jpg)` }}>
                <img className="user-pic" src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} alt={donneesUtilisateur.nom_utilisateur} />
            </div>

            <div className='user-dessous-banniere'>

                {/* Menu */}
                <div className="user-tabs">
                    <div className={`user-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Infos</div>
                    <div className={`user-tab ${activeTab === "assos" ? "active" : ""}`} onClick={() => setActiveTab("assos")}>Associations</div>
                    <div className={`user-tab ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>Questions du portail</div>
                </div>

                {/* Contenu des onglets */}
                <div className="user-tab-content">
                    <div className='asso-bloc-interne'>
                        {activeTab === "info" && <TabInfo donneesUtilisateur={donneesUtilisateur} autoriseAModifier={autoriseAModifier} />}
                        {activeTab === "assos" && <TabAsso id={id} />}
                        {activeTab === "questions" && <TabQuestions id={id} autoriseAModifier={autoriseAModifier} />}
                    </div>
                </div>
            </div>

        </div>
    );
}
export default PageUtilisateur;
