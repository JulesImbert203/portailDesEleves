import { useEffect, useState } from 'react';
import { obtenirDataUser } from '../../api/api_utilisateurs';
import '../../assets/styles/utilisateur.scss';

import { useLayout } from '../../layouts/Layout';
import TabInfo from './PageUtilisateur/Info';
import TabAsso from './PageUtilisateur/Asso';
import TabQuestions from './PageUtilisateur/Question';
import { useParams } from 'react-router-dom';
import { verifierSuperutilisateur } from "../../api/api_utilisateurs";
import { BASE_URL } from '../../api/base';

function PageUtilisateur() {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState({});
    const [activeTab, setActiveTab] = useState("info");
    const { userData } = useLayout();
    const [autoriseAModifier, setAutoriseAModifier] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        setAutoriseAModifier(userData.id == id || userData.is_superuser);
    }, [id]);

    useEffect(() => {// Obtention des données utilisateur à afficher
        const fetchData = async () => {
            var data = await obtenirDataUser(id);
            setDonneesUtilisateur({
                prenom: data.prenom,
                nom: data.nom
            });
        };
        fetchData();
    }, [id]);

    if (donneesUtilisateur === null) { return (<p>Chargement...</p>); }

    return (
        <div className="user-container">
            {/* Bannière avec photo de profil */}
            <div className="user-banner" style={{ backgroundImage: `url(${BASE_URL}/upload/utilisateurs/minesvert.jpg)` }}>
                <img className="user-pic" src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} alt={donneesUtilisateur.nom_utilisateur} />
            </div>

            <div className='user-infos-principales'>
                <h2 className='user-nom'>{donneesUtilisateur.prenom} {donneesUtilisateur.nom}</h2>
            </div>

            {/* Menu */}
            <div className="user-tabs">
                <div className={`user-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Infos</div>
                <div className={`user-tab ${activeTab === "assos" ? "active" : ""}`} onClick={() => setActiveTab("assos")}>Associations</div>
                <div className={`user-tab ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>Questions du portail</div>
            </div>

            {/* Contenu des onglets */}
            <div className="user-tab-content">
                {activeTab === "info" && <TabInfo id={id} donneesUtilisateur={userData} autoriseAModifier={autoriseAModifier} />}
                {activeTab === "assos" && <TabAsso id={id} />}
                {activeTab === "questions" && <TabQuestions id={id} autoriseAModifier={autoriseAModifier} />}
            </div>

        </div>
    );
}
export default PageUtilisateur;
