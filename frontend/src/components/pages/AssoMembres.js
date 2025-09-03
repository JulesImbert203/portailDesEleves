import React, { useState, useEffect } from "react";
import { ajouterMembre, chargerAsso, estUtilisateurDansAsso, modifierPositionMembre, modifierRoleMembre, retirerMembre } from "../../api/api_associations";
import { obtenirListeDesPromos, obtenirListeDesUtilisateursParPromo } from "../../api/api_utilisateurs";
import { useLayout } from "../../layouts/Layout";
import PageUtilisateur from "./PageUtilisateur";

function AssoMembres({ asso_id }) {
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);
    const [listeMembres, setListeMembres] = useState([]);
    const [isGestionMembres, setIsGestionMembres] = useState(false);
    const [isAjoutMembre, setIsAjoutMembre] = useState(false);
    const [listePromos, setListePromos] = useState(null);
    const [listeNouveauxMembres, setListeNouveauxMembres] = useState([]);
    const [promoAjoutMembre, setPromoAjoutMembre] = useState("");
    const [idAjoutMembre, setIdAjoutMembre] = useState("");
    const [idMembreModifier, setIdMembreModifier] = useState(null);
    const [nouveauRole, setNouveauRole] = useState(null);
    const [nouvellePosition, setNouvellePosition] = useState("");

    const { setCurrentComponent } = useLayout();

    const handleSetIsGestionMembres = (newState) => {
        if (!newState) {
            setIdMembreModifier(null);
            setPromoAjoutMembre("");
            setIdAjoutMembre("");
            setIsAjoutMembre(false);
        }
        setIsGestionMembres(newState);
    }

    const handleRetirerMembre = async (membreId) => {
        try {
            await retirerMembre(asso_id, membreId);
            const asso = await chargerAsso(asso_id);
            setListeMembres(asso.membres);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMembreChange = async (membreId) => {
        if (nouveauRole != null) {
            try {
                await modifierRoleMembre(asso_id, membreId, nouveauRole);
                const asso = await chargerAsso(asso_id);
                setListeMembres(asso.membres);
            } catch (erreur) {
                console.error(erreur);
            }
        }
        if (nouvellePosition != null) {
            try {
                await modifierPositionMembre(asso_id, membreId, parseInt(nouvellePosition));
                const asso = await chargerAsso(asso_id);
                setListeMembres(asso.membres)
            } catch (erreur) {
                console.error(erreur)
            }
        }
        setIdMembreModifier(null);
    }

    const handleSetPromoAjoutMembre = async (promo) => {
        if (promo !== "") {
            try {
                const listeMembres = await obtenirListeDesUtilisateursParPromo(promo);
                setListeNouveauxMembres(listeMembres);
                setPromoAjoutMembre(promo);
            } catch (erreur) {
                console.error(erreur);
            }
        }
        else {
            setPromoAjoutMembre(promo);
            setIdAjoutMembre("");
        }
    }

    const handleAjoutMembre = async (userId) => {
        if (idAjoutMembre != null) {
            try {
                await ajouterMembre(asso_id, userId);
                setIsAjoutMembre(false);
                setIdAjoutMembre("");
                const asso = await chargerAsso(asso_id);
                setListeMembres(asso.membres);
            } catch (erreur) {
                console.error(erreur);
            }
        }
        setIsAjoutMembre(false);
        setIdAjoutMembre("");
    }

    const handleModifierParametres = (userId, userRole, userPosition) => {
        if (idMembreModifier === userId) {
            setIdMembreModifier(null);
        }
        else {
            setNouveauRole(userRole);
            setNouvellePosition(userPosition);
            setIdMembreModifier(userId);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const asso = await chargerAsso(asso_id);
                const membreData = await estUtilisateurDansAsso(asso_id);
                const promos = await obtenirListeDesPromos();
                setIsMembreAutorise(membreData.autorise);
                setListeMembres(asso.membres);
                setListePromos(promos.sort().reverse());
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [asso_id]);

    return (
        <div className="asso-membres">
            <div className='asso-titre-description'>
                <h2>Les membres</h2>
                {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => handleSetIsGestionMembres(!isGestionMembres)}>
                    <img src="/assets/icons/edit.svg" alt="Copy" className="asso-button-icon" />
                    <p id="texteCopier">Éditer</p>
                </div>}
            </div>
            <div className="asso-membres-grid">
                {listeMembres.map((user) => (
                    <div className="asso-membres-item" key={user.id}>
                        <div className='member-image-holder'>

                            {/* Bouton pour supprimer le membre */}
                            {isGestionMembres && (<div className='button-suppression-membre' title='Supprimer ce membre' onClick={() => handleRetirerMembre(user.id)}>
                                <img src="/assets/icons/delete.svg" alt="suppression du membre" />
                            </div>)}

                            {/* Bouton pour éditer le rôle et la position */}
                            {isGestionMembres && (<div className='button-modification-role' title='Modifier les paramètres' onClick={() => { handleModifierParametres(user.id, user.role, user.position) }}>
                                <img src="/assets/icons/edit.svg" alt="modification de rôle" />
                            </div>)}
                            <img
                                src="http://127.0.0.1:5000/upload/utilisateurs/09brique.jpg"
                                alt={`${user.nom_utilisateur}`}
                                className="asso-membres-photo"
                                onClick={() => setCurrentComponent(<PageUtilisateur id={user.id} />)}
                            />
                        </div>
                        <p className="asso-membres-name">{user.nom_utilisateur}</p>
                        {idMembreModifier !== user.id && <p className="asso-membres-role">{user.role}</p>}

                        {/* Input pour changer le rôle */}
                        {idMembreModifier === user.id && <>
                            <label htmlFor='role-input' className='asso-membres-label'>Rôle</label>
                            <input value={nouveauRole} id='role-input' className='asso-membres-input' onChange={(e) => setNouveauRole(e.target.value)}></input>
                        </>}
                        {isGestionMembres && idMembreModifier !== user.id && <p className="asso-membres-position"><hr />Position : {user.position}</p>}

                        {/* Input pour changer l'ordre d'affichage */}
                        {idMembreModifier === user.id && <>
                            <label htmlFor='position-input' className='asso-membres-label'>Position</label>
                            <input value={nouvellePosition} type='number' id='position-input' className='asso-membres-input' onChange={(e) => setNouvellePosition(e.target.value)}></input>
                            {/* Validation de changements */}
                            <button onClick={() => handleMembreChange(user.id)}>Valider</button>
                        </>}
                    </div>
                ))}

                {/* Bouton pour rajouter un nouveau membre */}
                {isMembreAutorise && isGestionMembres && <div className='asso-membres-item'>
                    <img src='/assets/icons/plus.svg' alt="Ajouter une association" className="asso-membres-photo-plus" onClick={() => setIsAjoutMembre(!isAjoutMembre)} />
                    {!isAjoutMembre && <p className="asso-membres-name">Ajouter un membre</p>}
                    {isAjoutMembre && <>
                        <label htmlFor='promo-select' className='asso-membres-label'>Promotion</label>
                        <select id='promo-select' className='asso-newmember-selector' value={promoAjoutMembre} onChange={(e) => handleSetPromoAjoutMembre(e.target.value)}>
                            <option value="">---</option>
                            {listePromos.map((promoId) => <option key={promoId}>{promoId}</option>)}
                        </select>
                        <label htmlFor='membre-select' className='asso-membres-label'>Nom</label>
                        <select id='membre-select' className='asso-newmember-selector' value={idAjoutMembre} onChange={(e) => setIdAjoutMembre(e.target.value)}>
                            <option value="">---</option>
                            {listeNouveauxMembres.map((user) => <option key={user.id} value={user.id}>{user.nom_utilisateur}</option>)}
                        </select>
                        <button onClick={() => handleAjoutMembre(idAjoutMembre)}>Ajouter</button>
                    </>}
                </div>}
            </div>
        </div>
    )
}

export default AssoMembres;