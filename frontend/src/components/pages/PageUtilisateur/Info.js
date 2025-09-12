import { useState, useEffect } from "react";

import { useLayout } from "../../../layouts/Layout";
import '../../../assets/styles/utilisateur.css';


export default function TabInfo({ donneesUtilisateur, autoriseAModifier }) {
    const [isGestion, setIsGestion] = useState(false);
    const [userInfos, setUserInfos] = useState({
        "000Promo ": donneesUtilisateur.promotion,
        "010Date de naissance ": donneesUtilisateur.date_de_naissance,
        "020Chambre ": donneesUtilisateur.chambre,
        "030Ville d'origine ": donneesUtilisateur.ville_origine,
        "040Instruments joués ": donneesUtilisateur.instruments,
        "050Co ": donneesUtilisateur.co_nom,
        "060Parrainne ": donneesUtilisateur.marrain_nom,
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfos({ ...userInfos, [name]: value })
    };

    const validerModifierEvent = () => {

    }

    return (<>
        {autoriseAModifier && <div className='asso-button' id="asso-description-button" onClick={() => setIsGestion(!isGestion)}>
            <img src="/assets/icons/edit.svg" alt="Copy" />
            <p id="texteCopier">Éditer</p>
        </div>}
        <h2 className='user-nom'>
            {donneesUtilisateur.prenom} {donneesUtilisateur.surnom !== null && `'${donneesUtilisateur.surnom}'`} {donneesUtilisateur.nom_de_famille}
        </h2>
        <div className='user-info-contact'>
            {/* Section Téléphone */}
            <div className="user-contact">
                <img src="/assets/icons/phone.svg" alt="Phone" className="user-icon" />
                <div className='asso-button'>
                    <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon" onClick={() => copyToClipboard(donneesUtilisateur.telephone || '01 23 45 67 89')} />
                    <p id="texteCopier">copier</p>
                </div>
                <p className='user-donnee-contact'>{donneesUtilisateur.telephone || '01 23 45 67 89'}</p> {/* Mettre le numéro réel ici */}
            </div>

            {/* Section Email */}
            <div className="user-contact">
                <img src="/assets/icons/mail.svg" alt="Mail" className="user-icon" />
                <div className='copyButton'>
                    <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon copy" onClick={() => copyToClipboard(donneesUtilisateur.email || 'example@mail.com')} />
                    <p id="texteCopier">copier</p>
                </div>
                <p className='user-donnee-contact'>{donneesUtilisateur.email || 'example@mail.com'}</p> {/* Mettre l'email réel ici */}
            </div>
        </div>


        {!isGestion && <>
            {Object.keys(userInfos).map(key => {
                return (<p>{key.slice(3, -1)} : {userInfos[key]}</p>)
            })}
        </>}
        {isGestion && <>
            {Array.from(Object.keys(userInfos)).sort().map(key => {
                return (<p>
                    {key.slice(3, -1)} : <input type="text" name={key} value={userInfos[key]} onChange={handleChange} ></input>
                </p>)
            })}
            <div className='buttons-container'>
                <div className='valider-button' onClick={validerModifierEvent}>
                    <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                    <p>Ajouter</p>
                </div>
                <div className='annuler-button' onClick={() => setIsGestion(false)}>
                    <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                    <p>Annuler</p>
                </div>
            </div>
        </>}
    </>
    );
}

