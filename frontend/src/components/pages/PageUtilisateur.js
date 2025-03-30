import React, { useEffect, useState } from 'react';
import { obtenirDataUser } from '../../api';
import '../../assets/styles/utilisateur.css'; 


function PageUtilisateur({ id }) {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState([]);
    const [activeTab, setActiveTab] = useState("info");

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
            }).catch((err) => {
                console.error("Erreur lors de la copie : ", err);
            });
        } else {
            console.log("La fonctionnalité de copier dans le presse-papiers n'est pas supportée.");
        }
    };
    
    useEffect(() => {
        const chargerUtilisateur = async () => {
            const data = await obtenirDataUser(id);
            setDonneesUtilisateur(data);
        };
        chargerUtilisateur();
    }, [id]);

    if (donneesUtilisateur === null) {return (<p>Chargement...</p>);}

    return (
        <div className="user-container">
            {/* Bannière avec photo de profil */}
            <div className="user-banner" style={{ backgroundImage: `url(http://127.0.0.1:5000/upload/utilisateurs/minesvert.jpg)` }}>
                <img className="user-pic" src={`http://127.0.0.1:5000/upload/utilisateurs/09brique.jpg`} alt={donneesUtilisateur.nom_utilisateur} />
            </div>

            <div className='user-dessous-banniere'>

                <div className='user-infos-principales'>
                    <h2 className='user-nom'>
                        {donneesUtilisateur.prenom} {donneesUtilisateur.surnom !== null && `'${donneesUtilisateur.surnom}'`} {donneesUtilisateur.nom_de_famille}
                    </h2>

                    <div className='user-info-contact'>
                        {/* Section Téléphone */}
                        <div className="user-contact">
                            <img src="/assets/icons/phone.svg" alt="Phone" className="user-icon"/>
                            <div className='copyButton'>
                                <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon" onClick={() => copyToClipboard(donneesUtilisateur.telephone || '01 23 45 67 89')}/> 
                                <p id="texteCopier">copier</p>
                            </div>
                            <p className='user-donnee-contact'>{donneesUtilisateur.telephone || '01 23 45 67 89'}</p> {/* Mettre le numéro réel ici */}
                        </div>

                        {/* Section Email */}
                        <div className="user-contact">
                            <img src="/assets/icons/mail.svg" alt="Mail" className="user-icon" />
                            <div className='copyButton'>
                                <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon copy" onClick={() => copyToClipboard(donneesUtilisateur.email || 'example@mail.com')}/>
                                <p id="texteCopier">copier</p>
                            </div>
                            <p className='user-donnee-contact'>{donneesUtilisateur.email || 'example@mail.com'}</p> {/* Mettre l'email réel ici */}
                        </div>
                    </div>
                </div>
                
                {/* Menu */}
                <div className="user-tabs">
                    <div className={`user-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Infos</div>
                    <div className={`user-tab ${activeTab === "assos" ? "active" : ""}`} onClick={() => setActiveTab("assos")}>Associations</div>
                    <div className={`user-tab ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>Questions du portail</div>
                </div>
                
                {/* Contenu des onglets */}
                <div className="user-tab-content">
                    {activeTab === "info" && <p>Infos principales</p>}
                    {activeTab === "assos" && <p>Liste des associations ici...</p>}
                    {activeTab === "questions" && <p>Questions du portail ici...</p>}
                </div>
            </div>

        </div>
    );
}
export default PageUtilisateur;
