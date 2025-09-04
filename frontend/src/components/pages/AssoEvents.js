import React, { useState, useEffect } from "react";
import {
    creerNouvelEvenement,
    modifierEvenement,
    obtenirEvenementsAsso,
    supprimerEvenement
} from "../../api/api_evenements";
import { estUtilisateurDansAsso } from "../../api/api_associations";

function AssoEvents({ asso_id }) {
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);
    const [isGestionEvents, setIsGestionEvents] = useState(false);
    const [listeEvents, setListeEvents] = useState([]);
    const [isNewEvent, setIsNewEvent] = useState(false);
    const [newEventTemps, setNewEventTemps] = useState({
        "date_de_debut": "",
        "heure_de_debut": "",
        "date_de_fin": "",
        "heure_de_fin": ""
    });
    const [newEventTempsPeriodique, setNewEventTempsPeriodique] = useState({
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

    const [idEventModifier, setIdEventModifier] = useState(null);
    const [modifierEventTemps, setModifierEventTemps] = useState({
        "date_de_debut": "",
        "heure_de_debut": "",
        "date_de_fin": "",
        "heure_de_fin": ""
    });
    const [modifierEventTempsPeriodique, setModifierEventTempsPeriodique] = useState({
        "jours_de_la_semaine": [],
        "heure_de_debut": "",
        "heure_de_fin": ""
    });
    const [modifierEvent, setModifierEvent] = useState({
        "nom": "",
        "description": "",
        "lieu": "",
        "evenement_periodique": false,
    });

    // La création d'un nouvel événement
    const clearNewEvent = () => {
        setNewEventTemps({
            "date_de_debut": "",
            "heure_de_debut": "",
            "date_de_fin": "",
            "heure_de_fin": ""
        });
        setNewEventTempsPeriodique({
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

    const handleSetNewEventTempsPeriodique = (e) => {
        const { name, value, checked } = e.target;
        setNewEventTempsPeriodique(prevState => {
            // Les jours de la semaine pour un événement périodique
            if (name === 'jours_de_la_semaine') {
                const currentDays = newEventTempsPeriodique.jours_de_la_semaine;
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
    };

    const handleSetNewEventTemps = (e) => {
        const { name, value } = e.target;
        setNewEventTemps(prevState => {
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
                ...newEventTempsPeriodique,
                ...{
                    date_de_debut: `${newEventTemps.date_de_debut}T${newEventTemps.heure_de_debut}:00`,
                    date_de_fin: `${newEventTemps.date_de_fin}T${newEventTemps.heure_de_fin}:00`
                }
            };
            await creerNouvelEvenement(asso_id, newEvent);
            clearNewEvent();
            setIsNewEvent(false);
            const events = await obtenirEvenementsAsso(asso_id);
            const sortedEvents = sortEvents(events.evenements)
            setListeEvents(sortedEvents);
        } catch (error) {
            console.error(error);
        }
    };

    // La modification d'un événement existant
    const clearModiferEvent = () => {
        setModifierEventTemps({
            "date_de_debut": "",
            "heure_de_debut": "",
            "date_de_fin": "",
            "heure_de_fin": ""
        });
        setModifierEventTempsPeriodique({
            "jours_de_la_semaine": [],
            "heure_de_debut": "",
            "heure_de_fin": ""
        });
        setModifierEvent({
            "nom": "",
            "description": "",
            "lieu": "",
            "evenement_periodique": false,
        });
    };

    const handleSetModifierEvent = (e) => {
        const { name, value, checked } = e.target;
        setModifierEvent(prevState => {
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

    const handleSetModifierEventTempsPeriodique = (e) => {
        const { name, value, checked } = e.target;
        setModifierEventTempsPeriodique(prevState => {
            // Les jours de la semaine pour un événement périodique
            if (name === 'jours_de_la_semaine') {
                const currentDays = modifierEventTempsPeriodique.jours_de_la_semaine;
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
    };

    const handleSetModifierEventTemps = (e) => {
        const { name, value } = e.target;
        setModifierEventTemps(prevState => {
            return {
                ...prevState,
                [name]: value
            };
        });
    };

    const validerModifierEvent = async () => {
        try {
            const newEvent = {
                ...modifierEvent,
                ...modifierEventTempsPeriodique,
                ...{
                    date_de_debut: `${modifierEventTemps.date_de_debut}T${modifierEventTemps.heure_de_debut}:00`,
                    date_de_fin: `${modifierEventTemps.date_de_fin}T${modifierEventTemps.heure_de_fin}:00`
                }
            };
            await modifierEvenement(asso_id, idEventModifier, newEvent);
            clearModiferEvent();
            setIdEventModifier(null);
            const events = await obtenirEvenementsAsso(asso_id);
            const sortedEvents = sortEvents(events.evenements);
            setListeEvents(sortedEvents);
        } catch (error) {
            console.error(error);
        }
    };

    // La logique
    const handleIsGestionEvents = (newState) => {
        if (!newState) {
            clearNewEvent();
            setIsNewEvent(false);
        }
        setIsGestionEvents(newState);
    };

    const handleSetIdEventModifier = (event_id) => {
        if (idEventModifier !== event_id) {
            clearModiferEvent();
            const event = listeEvents.find(e => e.id === event_id)
            const { nom, description, lieu, evenement_periodique } = event;
            setModifierEvent({ nom, description, lieu, evenement_periodique })
            if (evenement_periodique) {
                const { jours_de_la_semaine, heure_de_debut, heure_de_fin } = event;
                setModifierEventTempsPeriodique({ jours_de_la_semaine, heure_de_debut, heure_de_fin })
            } else {
                const dateDebut = new Date(event.date_de_debut);
                const dateFin = new Date(event.date_de_fin);
                const date_de_debut = dateDebut.toISOString().slice(0, 10);
                const heure_de_debut = dateDebut.toISOString().slice(11, 16);
                const date_de_fin = dateFin.toISOString().slice(0, 10);
                const heure_de_fin = dateFin.toISOString().slice(11, 16);
                setModifierEventTemps({ date_de_debut, heure_de_debut, date_de_fin, heure_de_fin })
            }
            setIdEventModifier(event_id);
        }
    }

    const removeEvent = async (event_id) => {
        try {
            await supprimerEvenement(asso_id, event_id);
            const events = await obtenirEvenementsAsso(asso_id);
            const sortedEvents = sortEvents(events.evenements);
            setListeEvents(sortedEvents);
        } catch (erreur) {
            console.error(erreur);
        }
    }

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

    function sortEvents(events) {
        return events.toSorted((a, b) => {
            // Les événements périodiques d'abord
            if (a.evenement_periodique && !b.evenement_periodique) {
                return -1;
            }
            if (!a.evenement_periodique && b.evenement_periodique) {
                return 1;
            }
            // Les événements récents d'abord
            if (!a.evenement_periodique && !b.evenement_periodique) {
                const dateA = new Date(a.date_de_debut);
                const dateB = new Date(b.date_de_debut);
                return dateB.getTime() - dateA.getTime();
            }
            return 0;
        });
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const membreData = await estUtilisateurDansAsso(asso_id);
                const eventsData = await obtenirEvenementsAsso(asso_id);
                const sortedEvents = sortEvents(eventsData.evenements)
                setIsMembreAutorise(membreData.autorise);
                setListeEvents(sortedEvents);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [asso_id]);

    return (
        <>
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
            <div className='asso-content-container'>

                {/* formulaire pour un nouvel événement */}
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
                                    <input type="checkbox" name="jours_de_la_semaine" value={day} checked={newEventTempsPeriodique.jours_de_la_semaine.includes(day)} onChange={handleSetNewEventTempsPeriodique} />
                                    {day}
                                </label>
                            ))}
                        </p>
                        <p>Heure début : <input value={newEventTempsPeriodique.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetNewEventTempsPeriodique} /></p>
                        <p>Heure fin : <input value={newEventTempsPeriodique.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetNewEventTempsPeriodique} /></p>
                    </>}

                    {/* événement unique */}
                    {!nouvelEvent.evenement_periodique && <>
                        <p>Date de début : <input value={newEventTemps.date_de_debut} name='date_de_debut' type='date' onChange={handleSetNewEventTemps} /></p>
                        <p>Heure de début : <input value={newEventTemps.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetNewEventTemps} /></p>
                        <p>Date de fin : <input value={newEventTemps.date_de_fin} name='date_de_fin' type='date' onChange={handleSetNewEventTemps} /></p>
                        <p>Heure de fin : <input value={newEventTemps.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetNewEventTemps} /></p>
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

                {/* Les événements existants */}
                {listeEvents.map((event) => (
                    <div key={event.id} className='asso-bloc-interne'>
                        {idEventModifier !== event.id &&
                            <>
                                <h2>{event.nom}</h2>
                                <p><strong>Quand</strong> : {formatEventDate(event)}</p>
                                <p><strong>Où</strong> : {event.lieu}</p>
                                <p>{event.description}</p>
                                {isGestionEvents && <div className='buttons-container'>
                                    <div className='asso-button' onClick={() => handleSetIdEventModifier(event.id)}>
                                        <img src="/assets/icons/edit.svg" alt="Editer" />
                                        <p>Editer</p>
                                    </div>
                                    <div className='annuler-button' onClick={() => removeEvent(event.id)}>
                                        <img src="/assets/icons/delete.svg" alt="Supprimer" />
                                        <p>Supprimer</p>
                                    </div>
                                </div>}
                            </>}

                        {/* Modification d'événement */}
                        {idEventModifier === event.id &&
                            <>
                                <h2>Titre : <input value={modifierEvent.nom} name='nom' onChange={handleSetModifierEvent} /></h2>
                                <p>Événement périodique <input type="checkbox" checked={modifierEvent.evenement_periodique} name='evenement_periodique' onChange={handleSetModifierEvent} /></p>
                                <p><strong>Quand</strong> : </p>

                                {/* événement périodique */}
                                {modifierEvent.evenement_periodique && <>
                                    <p>
                                        Jours :
                                        {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(day => (
                                            <label key={day}>
                                                <input type="checkbox" name="jours_de_la_semaine" value={day} checked={modifierEventTempsPeriodique.jours_de_la_semaine.includes(day)} onChange={handleSetModifierEventTempsPeriodique} />
                                                {day}
                                            </label>
                                        ))}
                                    </p>
                                    <p>Heure début : <input value={modifierEventTempsPeriodique.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetModifierEventTempsPeriodique} /></p>
                                    <p>Heure fin : <input value={modifierEventTempsPeriodique.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetModifierEventTempsPeriodique} /></p>
                                </>}

                                {/* événement unique */}
                                {!modifierEvent.evenement_periodique && <>
                                    <p>Date de début : <input value={modifierEventTemps.date_de_debut} name='date_de_debut' type='date' onChange={handleSetModifierEventTemps} /></p>
                                    <p>Heure de début : <input value={modifierEventTemps.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetModifierEventTemps} /></p>
                                    <p>Date de fin : <input value={modifierEventTemps.date_de_fin} name='date_de_fin' type='date' onChange={handleSetModifierEventTemps} /></p>
                                    <p>Heure de fin : <input value={modifierEventTemps.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetModifierEventTemps} /></p>
                                </>}
                                <p><strong>Où</strong> : <input value={modifierEvent.lieu} name='lieu' onChange={handleSetModifierEvent} /></p>
                                <p>Description : <textarea value={modifierEvent.description} name='description' onChange={handleSetModifierEvent} /></p>
                                <div className='buttons-container'>
                                    <div className='valider-button' onClick={validerModifierEvent}>
                                        <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                                        <p>Ajouter</p>
                                    </div>
                                    <div className='annuler-button' onClick={() => setIdEventModifier(null)}>
                                        <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                                        <p>Annuler</p>
                                    </div>
                                </div>
                            </>}
                    </div>
                ))}
            </div>
        </>
    )
}

export default AssoEvents;