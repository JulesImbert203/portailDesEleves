import React, { useState, useEffect } from "react";
import {
    creerNouvelEvenement,
    modifierEvenement,
    obtenirEvenementsAsso,
    supprimerEvenement
} from "../../../api/api_evenements";
import { estUtilisateurDansAsso } from "../../../api/api_associations";
import { Card, Button, Form, Row, Col } from "react-bootstrap";

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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Les événements</h2>
                {isMembreAutorise && <Button variant="outline-primary" onClick={() => handleIsGestionEvents(!isGestionEvents)}>
                    <img src="/assets/icons/edit.svg" alt="Edit" />
                    Éditer
                </Button>}
            </div>
            {isGestionEvents && !isNewEvent && <div className="d-flex gap-2 mb-3">
                <Button variant="success" onClick={() => setIsNewEvent(true)}>
                    <img src="/assets/icons/plus.svg" alt="Ajouter un événement" />
                    Ajouter un événement
                </Button>
            </div>}
            <div className="d-flex flex-column gap-3">

                {/* formulaire pour un nouvel événement */}
                {isNewEvent && <Card>
                    <Card.Body>
                        <Form>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="2">Titre</Form.Label>
                                <Col sm="10">
                                    <Form.Control value={nouvelEvent.nom} name='nom' onChange={handleSetNouvelEvent} />
                                </Col>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check type="checkbox" label="Événement périodique" checked={nouvelEvent.evenement_periodique} name='evenement_periodique' onChange={handleSetNouvelEvent} />
                            </Form.Group>

                            {nouvelEvent.evenement_periodique && <>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Jours</Form.Label>
                                    <Col sm="10">
                                        {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(day => (
                                            <Form.Check inline key={day} type="checkbox" name="jours_de_la_semaine" value={day} label={day} checked={newEventTempsPeriodique.jours_de_la_semaine.includes(day)} onChange={handleSetNewEventTempsPeriodique} />
                                        ))}
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Heure de début</Form.Label>
                                    <Col sm="10">
                                        <Form.Control value={newEventTempsPeriodique.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetNewEventTempsPeriodique} />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Heure de fin</Form.Label>
                                    <Col sm="10">
                                        <Form.Control value={newEventTempsPeriodique.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetNewEventTempsPeriodique} />
                                    </Col>
                                </Form.Group>
                            </>}

                            {!nouvelEvent.evenement_periodique && <>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Date de début</Form.Label>
                                    <Col sm="10">
                                        <Form.Control value={newEventTemps.date_de_debut} name='date_de_debut' type='date' onChange={handleSetNewEventTemps} />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Heure de début</Form.Label>
                                    <Col sm="10">
                                        <Form.Control value={newEventTemps.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetNewEventTemps} />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Date de fin</Form.Label>
                                    <Col sm="10">
                                        <Form.Control value={newEventTemps.date_de_fin} name='date_de_fin' type='date' onChange={handleSetNewEventTemps} />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">Heure de fin</Form.Label>
                                    <Col sm="10">
                                        <Form.Control value={newEventTemps.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetNewEventTemps} />
                                    </Col>
                                </Form.Group>
                            </>}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="2">Lieu</Form.Label>
                                <Col sm="10">
                                    <Form.Control value={nouvelEvent.lieu} name='lieu' onChange={handleSetNouvelEvent} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="2">Description</Form.Label>
                                <Col sm="10">
                                    <Form.Control as="textarea" value={nouvelEvent.description} name='description' onChange={handleSetNouvelEvent} />
                                </Col>
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="success" onClick={validerNouvelEvent}>Ajouter</Button>
                                <Button variant="danger" onClick={() => setIsNewEvent(false)}>Annuler</Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>}

                {/* Les événements existants */}
                {listeEvents.map((event) => (
                    <Card key={event.id}>
                        <Card.Body>
                            {idEventModifier !== event.id &&
                                <>
                                    <Card.Title>{event.nom}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{formatEventDate(event)}</Card.Subtitle>
                                    <Card.Text><strong>Où</strong> : {event.lieu}</Card.Text>
                                    <Card.Text>{event.description}</Card.Text>
                                    {isGestionEvents && <div className="d-flex gap-2 mt-3">
                                        <Button variant="primary" onClick={() => handleSetIdEventModifier(event.id)}>Éditer</Button>
                                        <Button variant="danger" onClick={() => removeEvent(event.id)}>Supprimer</Button>
                                    </div>}
                                </>}

                            {/* Modification d'événement */}
                            {idEventModifier === event.id &&
                                <Form>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Titre</Form.Label>
                                        <Col sm="10">
                                            <Form.Control value={modifierEvent.nom} name='nom' onChange={handleSetModifierEvent} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Check type="checkbox" label="Événement périodique" checked={modifierEvent.evenement_periodique} name='evenement_periodique' onChange={handleSetModifierEvent} />
                                    </Form.Group>

                                    {modifierEvent.evenement_periodique && <>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Jours</Form.Label>
                                            <Col sm="10">
                                                {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(day => (
                                                    <Form.Check inline key={day} type="checkbox" name="jours_de_la_semaine" value={day} label={day} checked={modifierEventTempsPeriodique.jours_de_la_semaine.includes(day)} onChange={handleSetModifierEventTempsPeriodique} />
                                                ))}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Heure de début</Form.Label>
                                            <Col sm="10">
                                                <Form.Control value={modifierEventTempsPeriodique.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetModifierEventTempsPeriodique} />
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Heure de fin</Form.Label>
                                            <Col sm="10">
                                                <Form.Control value={modifierEventTempsPeriodique.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetModifierEventTempsPeriodique} />
                                            </Col>
                                        </Form.Group>
                                    </>}

                                    {!modifierEvent.evenement_periodique && <>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Date de début</Form.Label>
                                            <Col sm="10">
                                                <Form.Control value={modifierEventTemps.date_de_debut} name='date_de_debut' type='date' onChange={handleSetModifierEventTemps} />
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Heure de début</Form.Label>
                                            <Col sm="10">
                                                <Form.Control value={modifierEventTemps.heure_de_debut} name='heure_de_debut' type='time' onChange={handleSetModifierEventTemps} />
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Date de fin</Form.Label>
                                            <Col sm="10">
                                                <Form.Control value={modifierEventTemps.date_de_fin} name='date_de_fin' type='date' onChange={handleSetModifierEventTemps} />
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm="2">Heure de fin</Form.Label>
                                            <Col sm="10">
                                                <Form.Control value={modifierEventTemps.heure_de_fin} name='heure_de_fin' type='time' onChange={handleSetModifierEventTemps} />
                                            </Col>
                                        </Form.Group>
                                    </>}
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Lieu</Form.Label>
                                        <Col sm="10">
                                            <Form.Control value={modifierEvent.lieu} name='lieu' onChange={handleSetModifierEvent} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Description</Form.Label>
                                        <Col sm="10">
                                            <Form.Control as="textarea" value={modifierEvent.description} name='description' onChange={handleSetModifierEvent} />
                                        </Col>
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button variant="success" onClick={validerModifierEvent}>Valider</Button>
                                        <Button variant="danger" onClick={() => setIdEventModifier(null)}>Annuler</Button>
                                    </div>
                                </Form>}
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </>
    )
}

export default AssoEvents;