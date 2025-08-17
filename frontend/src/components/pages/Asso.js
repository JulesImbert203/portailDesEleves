import React, { useEffect, useState, useSyncExternalStore } from 'react';
import '../../assets/styles/asso.css';
import { chargerAsso, estUtilisateurDansAsso, ajouterContenu, changerPhoto, modifier_description_asso, retirerMembre, modifierRoleMembre, obtenirListeDesPromos, obtenirListeDesUtilisateursParPromo, ajouterMembre } from './../../api';
import { useLayout } from '../../layouts/Layout';
import PageUtilisateur from './PageUtilisateur';


function Asso({ id }) {
    const [asso, setAsso] = useState(null);
    const [isMembreDansAsso, setIsMembreDansAsso] = useState(null);
    const [isMembreAutorise, setIsMembreAutorise] = useState(null);

    const [activeTab, setActiveTab] = useState("info");

    const [isBannerDarkened, setIsBannerDarkened] = useState(false);
    const [isPhotoDarkened, setIsPhotoDarkened] = useState(false);

    const [nouvelleDescription, setNouvelleDescription] = useState(null);
    const [nouveauRole, setNouveauRole] = useState(null);
    const { setCurrentComponent } = useLayout();

    const [isGestionMembres, setIsGestionMembres] = useState(false);

    const [isAjoutMembre, setIsAjoutMembre] = useState(false);
    const [listePromos, setListePromos] = useState(null);
    const [listeNouveauxMembres, setListeNouveauxMembres] = useState([]);
    const [promoAjoutMembre, setPromoAjoutMembre] = useState("");
    const [idAjoutMembre, setIdAjoutMembre] = useState("");

    const [idRoleModifier, setIdRoleModifier] = useState(null);

    const handleSetActiveTab = (newTab) => {
        handleSetIsGestionMembres(false);
        setActiveTab(newTab);
    }

    const handleModifierDescription = async () => {
        if (nouvelleDescription !== null) {
            try {
                await modifier_description_asso(id, nouvelleDescription);
                // Met a jour la description qui est affichée sur la page
                setAsso(prevAsso => ({
                    ...prevAsso,
                    description: nouvelleDescription,
                }));
            } catch (error) {
                console.log(error);
            }
            handleSetActiveTab("info");
        }
    };

    const annulerModifierDescription = () => {
        setNouvelleDescription(asso.description);
        handleSetActiveTab("info");
    };

    const handleSetIsGestionMembres = (newState) => {
        if (!newState) {
            setIdRoleModifier(null);
            setPromoAjoutMembre("");
            setIdAjoutMembre("");
        }
        setIsGestionMembres(newState);
    }

    const handleRetirerMembre = async (assoId, membreId) => {
        try {
            await retirerMembre(assoId, membreId);
            const assoData = await chargerAsso(id);
            setAsso(assoData);
        } catch (error) {
            console.log(error);
        }
    };

    const handleRoleChange = async (membreId) => {
        if (nouveauRole != null) {
            try {
                await modifierRoleMembre(id, membreId, nouveauRole);
                const assoData = await chargerAsso(id);
                setAsso(assoData);
            } catch (error) {
                console.log(error);
            }
        }
        setIdRoleModifier(null);
    }

    const handleSetPromoAjoutMembre = async (promo) => {
        if (promo != null) {
            try {
                const listeMembres = await obtenirListeDesUtilisateursParPromo(promo);
                setListeNouveauxMembres(listeMembres);
                setPromoAjoutMembre(promo);
            } catch (erreur) {
                console.log(erreur);
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
                await ajouterMembre(id, userId);
                setIsAjoutMembre(false);
                const assoData = await chargerAsso(id);
                setAsso(assoData);
            } catch (erreur) {
                console.log(erreur);
            }
        }
    }

    const changerPhotoLogoOuBanniere = (type_photo) => {
        document.getElementById('file-upload').setAttribute("data-type", type_photo);
        document.getElementById('file-upload').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Récupère le fichier sélectionné directement
        const type_photo = event.target.getAttribute("data-type");

        if (file) {
            console.log(`Fichier sélectionné (${type_photo}) :`, file.name);
            try {
                await ajouterContenu(id, file); // Téléversement 
                try {
                    await changerPhoto(id, type_photo, file.name);
                    setCurrentComponent(null);
                    setTimeout(() => {
                        setCurrentComponent(<Asso key={Date.now()} id={id} />);
                    }, 0);
                } catch (error) {
                    console.error(`Erreur : ${error}`);
                }
            } catch (error) {
                alert(`Erreur lors du téléversement : ${error.message}`);
            }
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const assoData = await chargerAsso(id);
                const membreData = await estUtilisateurDansAsso(id);
                const promos = await obtenirListeDesPromos();
                setAsso(assoData);
                setNouvelleDescription(assoData.description);
                setIsMembreDansAsso(membreData.is_membre);
                setIsMembreAutorise(membreData.autorise);
                setListePromos(promos);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [id]);


    if (asso === null || isMembreDansAsso === null) return <p>Chargement...</p>;

    return (
        <div className="asso-container">

            {/* Champ de fichier caché */}
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }} // Caché
                onChange={handleFileChange} // Téléverse automatiquement après sélection
            />



            {/* Bannière avec logo */}
            <div
                className="asso-banner"
                style={{
                    backgroundImage: asso.banniere_path
                        ? `url(http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.banniere_path})`
                        : 'none', // Si la bannière n'existe pas, pas d'image de fond
                    backgroundColor: asso.banniere_path ? 'transparent' : 'var(--global-style-secondary-color)', // Si la bannière n'existe pas, couleur de fond
                }}
            >
                {/*Accessible pour modifier les photos de l'asso*/}
                {isMembreAutorise && (
                    <>
                        {/* Overlay qui s'affiche uniquement si isDarkened est true */}
                        {isBannerDarkened && <div className="asso-overlay-banner"></div>}
                        <img id='asso-add-photo-banner' src='/assets/icons/add_photo.svg'
                            onMouseEnter={() => setIsBannerDarkened(true)}
                            onMouseLeave={() => setIsBannerDarkened(false)}
                            onClick={() => changerPhotoLogoOuBanniere('banniere')}
                        />
                    </>
                )}

                <img
                    className="asso-logo"
                    src={
                        asso.img
                            ? `http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.img}`
                            : '/assets/icons/group.svg'
                    }
                    alt={asso.nom}
                />

                {/*Accessible pour modifier les photos de l'asso*/}
                {isMembreAutorise && (
                    <>
                        {isPhotoDarkened && <div className="asso-overlay-profilpic"></div>}
                        <img id='asso-add-photo-profilpic' src='/assets/icons/add_photo.svg'
                            onMouseEnter={() => setIsPhotoDarkened(true)}
                            onMouseLeave={() => setIsPhotoDarkened(false)}
                            onClick={() => changerPhotoLogoOuBanniere('logo')}
                            alt="Modifier photo"
                        />
                    </>
                )}

            </div>


            <div className='asso-infos-principales'>
                <h2 className='asso-nom'>{asso.nom}</h2>
                {/* Administration de l'asso */}
                {isMembreAutorise &&
                    <div className='asso-admin'>
                        {isMembreDansAsso && <div className='badge_est_dans_asso'><p>Vous êtes dans l'asso</p></div>}
                        <button className='button_asso' id="button_asso_gerer_evenements">Gerer Événements</button>
                        <button className='button_asso' id="button_asso_gerer_publications">Gerer Publications</button>
                    </div>}
            </div>



            {/* Menu */}
            <div className="asso-tabs">
                <div className={`asso-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => handleSetActiveTab("info")}>Infos</div>
                <div className={`asso-tab ${activeTab === "events" ? "active" : ""}`} onClick={() => handleSetActiveTab("events")}>Événements</div>
                <div className={`asso-tab ${activeTab === "members" ? "active" : ""}`} onClick={() => handleSetActiveTab("members")}>Membres</div>
                <div className={`asso-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => handleSetActiveTab("posts")}>Publications</div>
            </div>

            {/* Contenu des onglets */}
            <div className="asso-tab-content">
                {activeTab === "info" &&
                    <div className='asso-info-section'>
                        <div className='asso-titre-description'>
                            <h2>Description de l'association</h2>
                            <div className='asso-button' id="asso-description-button" onClick={() => handleSetActiveTab("edit-desc")}>
                                <img src="/assets/icons/edit.svg" alt="Copy" className="asso-button-icon" />
                                <p id="texteCopier">Éditer</p>
                            </div>
                        </div>
                        <p>{asso.description}</p>
                    </div>}


                {activeTab === "events" && <div className='asso-bloc-interne'>
                    <p>Liste des événements ici...</p>
                </div>}


                {activeTab === "members" && (
                    <div className="asso-membres">
                        {isMembreAutorise &&
                            <div className='button-gestion-membres' onClick={() => { handleSetIsGestionMembres(!isGestionMembres) }}>
                                <img src="/assets/icons/edit.svg" alt="Copy" className="asso-button-icon" />
                                <p>Éditer</p>
                            </div>}
                        <div className="asso-membres-grid">
                            {asso.membres.map((user) => (
                                <div className="asso-membres-item" key={user.id}>
                                    <div className='member-image-holder'>
                                        {isGestionMembres && (<div className='button-suppression-membre' title='Supprimer ce membre' onClick={() => handleRetirerMembre(id, user.id)}>
                                            <img src="/assets/icons/delete.svg" alt="suppression du membre" />
                                        </div>)}
                                        {isGestionMembres && (<div className='button-modification-role' title='Modifier le rôle' onClick={() => { setNouveauRole(user.role); idRoleModifier === user.id ? setIdRoleModifier(null) : setIdRoleModifier(user.id) }}>
                                            <img src="/assets/icons/edit.svg" alt="modification de rôle" />
                                        </div>)}
                                        <img
                                            src="http://127.0.0.1:5000/upload/utilisateurs/09brique.jpg"
                                            alt={`Photo de ${user.nom_utilisateur}`}
                                            className="asso-membres-photo"
                                            onClick={() => setCurrentComponent(<PageUtilisateur id={user.id} />)}
                                        />
                                    </div>
                                    <p className="asso-membres-name">{user.nom_utilisateur}</p>
                                    {idRoleModifier !== user.id && <p className="asso-membres-role">{user.role}</p>}
                                    {idRoleModifier === user.id && <>
                                        <input value={nouveauRole} className='asso-membres-role-input' onChange={(e) => setNouveauRole(e.target.value)}></input>
                                        <button onClick={() => handleRoleChange(user.id, user.role)}>Valider</button>
                                    </>}
                                </div>
                            ))}
                            {isMembreAutorise && isGestionMembres && <div className='asso-membres-item'>
                                <img src='/assets/icons/plus.svg' alt="Ajouter une association" className="asso-membres-photo" onClick={() => setIsAjoutMembre(!isAjoutMembre)} />
                                {!isAjoutMembre && <p className="asso-membres-name">Ajouter un membre</p>}
                                {isAjoutMembre && <>
                                    <label htmlFor='promo-select' className='asso-members-label'>Promotion :</label>
                                    <select id='promo-select' className='asso-newmember-selector' value={promoAjoutMembre} onChange={(e) => handleSetPromoAjoutMembre(e.target.value)}>
                                        <option value="">---</option>
                                        {listePromos.map((promoId) => <option key={promoId}>{promoId}</option>)}
                                    </select>
                                    <label htmlFor='membre-select' className='asso-members-label'>Nom :</label>
                                    <select id='membre-select' className='asso-newmember-selector' value={idAjoutMembre} onChange={(e) => setIdAjoutMembre(e.target.value)}>
                                        <option value="">---</option>
                                        {listeNouveauxMembres.map((user) => <option key={user.id} value={user.id}>{user.nom_utilisateur}</option>)}
                                    </select>
                                    <button onClick={() => handleAjoutMembre(idAjoutMembre)}>Ajouter</button>
                                </>}
                            </div>}
                        </div>
                    </div>
                )}


                {activeTab === "posts" && <p>Publications ici...</p>}

                {/* Modifier la description */}
                {activeTab === "edit-desc" && <div>

                    <label>Nouvelle description :</label>
                    <textarea value={nouvelleDescription} onChange={(e) => setNouvelleDescription(e.target.value)} />
                    <button onClick={handleModifierDescription}>Valider</button>
                    <button onClick={annulerModifierDescription}>Annuler</button>
                </div>}
            </div>
        </div>
    );
}

export default Asso;
