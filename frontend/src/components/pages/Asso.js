import React, { useEffect, useState, useSyncExternalStore } from 'react';
import '../../assets/styles/asso.css';
import { chargerAsso, estUtilisateurDansAsso, ajouterContenu, changerPhoto, modifier_description_asso, retirerMembre, modifierRoleMembre, obtenirListeDesPromos, obtenirListeDesUtilisateursParPromo, ajouterMembre, modifierPositionMembre, updateMembersOrder, obtenirEvenementsAsso, creerNouvelEvenement } from './../../api';
import { useLayout } from '../../layouts/Layout';
import PageUtilisateur from './PageUtilisateur';
import RichEditor, { RichTextDisplay } from '../blocs/RichEditor';


function Asso({ id }) {
    const [asso, setAsso] = useState(null);
    const [isMembreDansAsso, setIsMembreDansAsso] = useState(null);
    const [isMembreAutorise, setIsMembreAutorise] = useState(null);

    const [activeTab, setActiveTab] = useState("info");

    const [isBannerDarkened, setIsBannerDarkened] = useState(false);
    const [isPhotoDarkened, setIsPhotoDarkened] = useState(false);

    const { setCurrentComponent } = useLayout();

    // Gestion de description
    const [nouvelleDescription, setNouvelleDescription] = useState(null);

    // Gestion d'événements
    const [isGestionEvents, setIsGestionEvents] = useState(false);
    const [listeEvents, setListeEvents] = useState([]);
    const [isNewEvent, setIsNewEvent] = useState(false);
    const [eventTemps, setEventTemps] = useState({
        "date_de_debut": "",
        "heure_de_debut": "",
        "date_de_fin": "",
        "heure_de_fin": ""
    });
    const [eventTempsPeriodique, setEventTempsPeriodique] = useState({
        "jours_de_la_semaine": [],
        "heure_de_debut": "",
        "heure_de_fin": ""
    });
    const [nouvelEvent, setNouvelEvent] = useState({
        "nom": "",
        "description": "",
        "lieu": "",
        "evenement_periodique": false,
    });

    // Gestion de membres
    const [isGestionMembres, setIsGestionMembres] = useState(false);
    const [isAjoutMembre, setIsAjoutMembre] = useState(false);
    const [listePromos, setListePromos] = useState(null);
    const [listeNouveauxMembres, setListeNouveauxMembres] = useState([]);
    const [promoAjoutMembre, setPromoAjoutMembre] = useState("");
    const [idAjoutMembre, setIdAjoutMembre] = useState("");
    const [idMembreModifier, setIdMembreModifier] = useState(null);
    const [nouveauRole, setNouveauRole] = useState(null);
    const [nouvellePosition, setNouvellePosition] = useState("");

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

    // Gestion des événements
    const clearNewEvent = () => {
        setEventTemps({
            "date_de_debut": "",
            "heure_de_debut": "",
            "date_de_fin": "",
            "heure_de_fin": ""
        });
        setEventTempsPeriodique({
            "jours_de_la_semaine": [],
            "heure_de_debut": "",
            "heure_de_fin": ""
        });
        setNouvelEvent({
            "nom": "",
            "description": "",
            "lieu": "",
            "evenement_periodique": false,
        });
    }


    const handleIsGestionEvents = (newState) => {
        if (!newState) {
            clearNewEvent();
            setIsNewEvent(false);
        }
        setIsGestionEvents(newState);
    }

    const handleSetNouvelEvent = (e) => {
        const { name, value, checked } = e.target;
        setNouvelEvent(prevState => {
            // Événement périodique
            if (name === 'evenement_periodique') {
                return {
                    ...prevState,
                    [name]: checked
                };
            }
            return {
                ...prevState,
                [name]: value
            };
        });
    };

    const handleSetEventTempsPeriodique = (e) => {
        const { name, value, checked } = e.target;
        setEventTempsPeriodique(prevState => {
            // Les jours de la semaine pour un événement périodique
            if (name === 'jours_de_la_semaine') {
                const currentDays = eventTempsPeriodique.jours_de_la_semaine;
                const updatedDays = checked ? [...currentDays, value] : currentDays.filter(day => day !== value);
                return {
                    ...prevState,
                    [name]: updatedDays
                };
            }
            return {
                ...prevState,
                [name]: value
            };
        });
    }

    const handleSetEventTemps = (e) => {
        const { name, value } = e.target;
        setEventTemps(prevState => {
            return {
                ...prevState,
                [name]: value
            };
        });
    }

    const validerNouvelEvent = async () => {
        try {
            const newEvent = {
                ...nouvelEvent,
                ...eventTempsPeriodique,
                ...{
                    date_de_debut: `${eventTemps.date_de_debut}T${eventTemps.heure_de_debut}:00`,
                    date_de_fin: `${eventTemps.date_de_fin}T${eventTemps.heure_de_fin}:00`
                }
            };
            await creerNouvelEvenement(id, newEvent);
            clearNewEvent();
            setIsNewEvent(false);
            const events = await obtenirEvenementsAsso(id);
            setListeEvents(events.evenements);
        } catch (error) {
            console.error(error);
        }
    };

    const formatEventDate = (event) => {
        if (event.evenement_periodique) {
            const jours = event.jours_de_la_semaine.map(day => day + "s").join(', ');
            const debutHeure = event.heure_de_debut;
            const finHeure = event.heure_de_fin;
            return `Tous les ${jours} de ${debutHeure} à ${finHeure}`;
        } else {
            const dateDebut = new Date(event.date_de_debut);
            const dateFin = new Date(event.date_de_fin);
            const debutDateStr = dateDebut.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const debutHeureStr = dateDebut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const finDateStr = dateFin.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const finHeureStr = dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            if (dateDebut.toDateString() === dateFin.toDateString()) {
                return `Le ${debutDateStr} de ${debutHeureStr} à ${finHeureStr}`;
            } else {
                return `Du ${debutDateStr} à ${debutHeureStr} au ${finDateStr} à ${finHeureStr}`;
            }
        }
    };

    // Gestion de membres
    const handleSetIsGestionMembres = (newState) => {
        if (!newState) {
            setIdMembreModifier(null);
            setPromoAjoutMembre("");
            setIdAjoutMembre("");
            setIsAjoutMembre(false);
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

    const handleMembreChange = async (membreId) => {
        if (nouveauRole != null) {
            try {
                await modifierRoleMembre(id, membreId, nouveauRole);
                const assoData = await chargerAsso(id);
                setAsso(assoData);
            } catch (erreur) {
                console.log(erreur);
            }
        }
        if (nouvellePosition != null) {
            try {
                await modifierPositionMembre(id, membreId, parseInt(nouvellePosition));
                await updateMembersOrder(id);
                const assoData = await chargerAsso(id);
                setAsso(assoData);
            } catch (erreur) {
                console.log(erreur)
            }
        }
        setIdMembreModifier(null);
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
                setIdAjoutMembre("");
                const assoData = await chargerAsso(id);
                setAsso(assoData);
            } catch (erreur) {
                console.log(erreur);
            }
        }
        setIsAjoutMembre(false);
        setIdAjoutMembre("");
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
                const assoData = await chargerAsso(id);
                const membreData = await estUtilisateurDansAsso(id);
                const promos = await obtenirListeDesPromos();
                const events = await obtenirEvenementsAsso(id);
                setAsso(assoData);
                setNouvelleDescription(assoData.description);
                setIsMembreDansAsso(membreData.is_membre);
                setIsMembreAutorise(membreData.autorise);
                setListePromos(promos.sort().reverse());
                setListeEvents(events.evenements)
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

                {/* Description de l'asso */}
                {activeTab === "info" &&
                    <div className='asso-info-section'>
                        <div className='asso-titre-description'>
                            <h2>Description de l'association</h2>
                            {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => handleSetActiveTab("edit-desc")}>
                                <img src="/assets/icons/edit.svg" alt="Copy" />
                                <p id="texteCopier">Éditer</p>
                            </div>}
                        </div>
                        <div className='asso-description'>
                            <RichTextDisplay content={asso.description}></RichTextDisplay>
                        </div>
                    </div>}

                {/* Modifier la description */}
                {activeTab === "edit-desc" && <>
                    <h2>Nouvelle description</h2>
                    <RichEditor value={nouvelleDescription} onChange={setNouvelleDescription} />
                    <div className='buttons-container'>
                        <div className='valider-button' onClick={handleModifierDescription}>
                            <img src="/assets/icons/check-mark.svg" alt="Valider" />
                            <p>Valider</p>
                        </div>
                        <div className='annuler-button' onClick={annulerModifierDescription}>
                            <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                            <p>Annuler</p>
                        </div>
                    </div>
                </>}

                {/* Événements */}
                {activeTab === "events" && <>
                    <div className='asso-titre-description'>
                        <h2>Les événements</h2>
                        {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => handleIsGestionEvents(!isGestionEvents)}>
                            <img src="/assets/icons/edit.svg" alt="Copy" className="asso-button-icon" />
                            <p id="texteCopier">Éditer</p>
                        </div>}
                    </div>
                    {isGestionEvents && !isNewEvent && <div className='buttons-container'>
                        <div className='valider-button' onClick={() => setIsNewEvent(true)}>
                            <img src="/assets/icons/plus.svg" alt="Ajouter un événement" />
                            <p>Ajouter un événement</p>
                        </div>
                    </div>}
                    <div className='asso-events-container'>
                        {isNewEvent && <div className='asso-bloc-interne'>
                            <h2>Titre : <input value={nouvelEvent.nom} name='nom' onChange={handleSetNouvelEvent} /></h2>
                            <p>Événement périodique <input type="checkbox" checked={nouvelEvent.evenement_periodique} name='evenement_periodique' onChange={handleSetNouvelEvent} /></p>
                            <p><strong>Quand</strong> : </p>
                            {/* événement périodique */}
                            {nouvelEvent.evenement_periodique && <>
                                <p>
                                    Jours : 
                                    {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(day => (
                                        <label key={day}>
                                            <input type="checkbox" name="jours_de_la_semaine" value={day} checked={eventTempsPeriodique.jours_de_la_semaine.includes(day)} onChange={handleSetEventTempsPeriodique} />
                                            {day}
                                        </label>
                                    ))}
                                </p>
                                <p>Heure début : <input value={eventTempsPeriodique.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetEventTempsPeriodique} /></p>
                                <p>Heure fin : <input value={eventTempsPeriodique.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetEventTempsPeriodique} /></p>
                            </>}
                            {/* événement unique */}
                            {!nouvelEvent.evenement_periodique && <>
                                <p>Date de début : <input value={eventTemps.date_de_debut} name='date_de_debut' type='date' onChange={handleSetEventTemps} /></p>
                                <p>Heure de début : <input value={eventTemps.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetEventTemps} /></p>
                                <p>Date de fin : <input value={eventTemps.date_de_fin} name='date_de_fin' type='date' onChange={handleSetEventTemps} /></p>
                                <p>Heure de fin : <input value={eventTemps.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetEventTemps} /></p>
                            </>}
                            <p><strong>Où</strong> : <input value={nouvelEvent.lieu} name='lieu' onChange={handleSetNouvelEvent} /></p>
                            <p>Description : <textarea value={nouvelEvent.description} name='description' onChange={handleSetNouvelEvent} /></p>
                            {isNewEvent && <div className='buttons-container'>
                                <div className='valider-button' onClick={validerNouvelEvent}>
                                    <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                                    <p>Ajouter</p>
                                </div>
                                <div className='annuler-button' onClick={() => setIsNewEvent(false)}>
                                    <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                                    <p>Annuler</p>
                                </div>
                            </div>}
                        </div>}
                        {listeEvents.map((event) => (
                            <div className='asso-bloc-interne'>
                                <h2>{event.nom}</h2>
                                <p><strong>Quand</strong> : {formatEventDate(event)}</p>
                                <p><strong>Où</strong> : {event.lieu}</p>
                                <p>{event.description}</p>
                                {isGestionEvents && <div className='buttons-container'>
                                    <div className='asso-button' onClick={handleModifierDescription}>
                                        <img src="/assets/icons/edit.svg" alt="Editer" />
                                        <p>Editer</p>
                                    </div>
                                    <div className='annuler-button' onClick={annulerModifierDescription}>
                                        <img src="/assets/icons/delete.svg" alt="Supprimer" />
                                        <p>Supprimer</p>
                                    </div>
                                </div>}
                            </div>
                        ))}
                    </div>
                </>}

                {/* Membres */}
                {activeTab === "members" && (
                    <div className="asso-membres">
                        <div className='asso-titre-description'>
                            <h2>Les membres</h2>
                            {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => handleSetIsGestionMembres(!isGestionMembres)}>
                                <img src="/assets/icons/edit.svg" alt="Copy" className="asso-button-icon" />
                                <p id="texteCopier">Éditer</p>
                            </div>}
                        </div>
                        <div className="asso-membres-grid">
                            {asso.membres.map((user) => (
                                <div className="asso-membres-item" key={user.id}>
                                    <div className='member-image-holder'>

                                        {/* Bouton pour supprimer le membre */}
                                        {isGestionMembres && (<div className='button-suppression-membre' title='Supprimer ce membre' onClick={() => handleRetirerMembre(id, user.id)}>
                                            <img src="/assets/icons/delete.svg" alt="suppression du membre" />
                                        </div>)}

                                        {/* Bouton pour éditer le rôle et la position */}
                                        {isGestionMembres && (<div className='button-modification-role' title='Modifier les paramètres' onClick={() => { handleModifierParametres(user.id, user.role, user.position) }}>
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
                                    {idMembreModifier !== user.id && <p className="asso-membres-role">{user.role}</p>}

                                    {/* Input pour changer le rôle */}
                                    {idMembreModifier === user.id && <>
                                        <label htmlFor='role-input' className='asso-membres-label'>Rôle</label>
                                        <input value={nouveauRole} id='role-input' className='asso-membres-input' onChange={(e) => setNouveauRole(e.target.value)}></input>
                                    </>}
                                    {isGestionMembres && idMembreModifier !== user.id && <p className="asso-membres-role">Position : {user.position}</p>}

                                    {/* Input pour changer l'ordre d'affichage */}
                                    {idMembreModifier == user.id && <>
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
                )}


                {activeTab === "posts" && <p>Publications ici...</p>}
            </div>
        </div >
    );
}

export default Asso;
