import React, { useEffect, useState, useSyncExternalStore } from 'react';
import '../../assets/styles/asso.css';
import { chargerAsso, estUtilisateurDansAsso, ajouterContenu, changerPhoto, modifier_description_asso, retirerMembre, modifierRoleMembre } from './../../api';
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
    const [idMembreModifier, setIdMembreModifier] = useState(null);

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
            setActiveTab("info");
        }
    };

    const annulerModifierDescription = () => {
        setNouvelleDescription(asso.description);
        setActiveTab("info");
    };

    const handleRetirerMembre = async (assoId, membreId) => {
        try {
            await retirerMembre(assoId, membreId);
            setAsso(prevAsso => ({
                ...prevAsso,
                membres: prevAsso.membres.filter(membre => membre.id !== membreId),
            }));
        } catch (error) {
            console.log(error);
        }
    };

    const handleRoleChange = async (membreId) => {
        if (nouveauRole !== "") {
            try {
                await modifierRoleMembre(id, membreId, nouveauRole);
                setAsso(prevAsso => ({
                    ...prevAsso,
                    membres: prevAsso.membres.map(membre => {
                        if (membre.id === membreId) {
                            return {
                                ...membre,
                                role: nouveauRole
                            };
                        }
                        return membre;
                    }),
                }));
            } catch (error) {
                console.log(error);
            }
        }
        setIdMembreModifier(null);
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
                setAsso(assoData);
                setNouvelleDescription(assoData.description);
                setIsMembreDansAsso(membreData.is_membre);
                setIsMembreAutorise(membreData.autorise);
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
                <div className={`asso-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Infos</div>
                <div className={`asso-tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>Événements</div>
                <div className={`asso-tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>Membres</div>
                <div className={`asso-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>Publications</div>
            </div>

            {/* Contenu des onglets */}
            <div className="asso-tab-content">
                {activeTab === "info" &&
                    <div className='asso-info-section'>
                        <div className='asso-titre-description'>
                            <h2>Description de l'association</h2>
                            <div className='asso-button' id="asso-description-button" onClick={() => setActiveTab("edit-desc")}>
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
                            <div className='button-gestion-membres' onClick={() => { setIsGestionMembres(!isGestionMembres); setIdMembreModifier(null) }}>
                                <img src="/assets/icons/edit.svg" alt="Copy" className="asso-button-icon" />
                                <p>Éditer</p>
                            </div>}
                        <div className="asso-membres-grid">
                            {asso.membres.map((user) => (
                                <div className="asso-membres-item" key={user.id}>
                                    <div className='member-image-holder'>
                                        {isGestionMembres && (<div className='button-suppression-membre' title='supprimer le membre' onClick={() => handleRetirerMembre(id, user.id)}>
                                            <img src="/assets/icons/delete.svg" alt="suppression du membre" />
                                        </div>)}
                                        {isGestionMembres && (<div className='button-modification-role' title='modifier le rôle' onClick={() => { setNouveauRole(user.role); idMembreModifier === user.id ? setIdMembreModifier(null) : setIdMembreModifier(user.id) }}>
                                            <img src="/assets/icons/edit.svg" alt="modification de rôle" />
                                        </div>)}
                                        <img
                                            src="http://127.0.0.1:5000/upload/utilisateurs/09brique.jpg"
                                            alt={`Photo de ${user.nom_utilisateur}`}
                                            className="asso-membres-photo"
                                            onClick={() => setCurrentComponent(<PageUtilisateur id={user.id}/>)}
                                        />
                                    </div>
                                    <p className="asso-membres-name">{user.nom_utilisateur}</p>
                                    {idMembreModifier !== user.id && <p className="asso-membres-role">{user.role}</p>}
                                    {idMembreModifier === user.id && <>
                                        <input value={nouveauRole} className='asso-membres-role-input' onChange={(e) => setNouveauRole(e.target.value)}></input>
                                        <button onClick={() => handleRoleChange(user.id, user.role)}>Valider</button>
                                    </>}
                                </div>
                            ))}
                            {isMembreAutorise && isGestionMembres && (<div className='asso-membres-item'>
                                <img src='/assets/icons/plus.svg' alt="Ajouter une association" className="asso-membres-photo" onClick={() => setCurrentComponent()} />
                                <p className="asso-membres-name">Ajouter un membre</p>
                            </div>)}
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
