import React, { useEffect, useState } from "react";
import { estUtilisateurDansAsso } from "../../api/api_associations";
import { creerNouvellePublication, obtenirPublicationsAsso, supprimerPublication } from "../../api/api_publications";

function AssoPosts({ asso_id }) {
    const [isGestion, setIsGestion] = useState(false);
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);
    const [isNewPost, setIsNewPost] = useState(false);
    const [newPost, setNewPost] = useState({
        // "id": null,
        // "id_association": null,
        // "id_auteur": null,
        // "is_publiee_par_utilisateur": null,
        // "date_publication": null,
        // "likes": null,
        "titre": "",
        "contenu": "",
        "is_commentable": true,
        "a_cacher_to_cycles": [],
        "a_cacher_to_promos": [],
        "is_publication_interne": false
    })
    const [listePosts, setListePosts] = useState([]);

    const clearPost = () => {
        setNewPost({
            "titre": "",
            "contenu": "",
            "is_commentable": true,
            "a_cacher_to_cycles": [],
            "a_cacher_to_promos": [],
            "is_publication_interne": false
        })
    }

    const handleSetNewPost = (e) => {
        const { name, value, checked } = e.target;
        setNewPost(prevState => {
            if (name === 'is_commentable') {
                return {
                    ...prevState,
                    [name]: checked
                };
            }
            if (name === 'is_publication_interne') {
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

    const removePost = async (post_id) => {
        try {
            await supprimerPublication(asso_id, post_id);
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const validateNewPost = async () => {
        try {
            await modifierEvenement(asso_id, idEventModifier, newEvent);
            clearModiferEvent();
            setIdEventModifier(null);
            const events = await obtenirEvenementsAsso(asso_id);
            const sortedEvents = sortEvents(events.evenements);
            setListeEvents(sortedEvents);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const membreData = await estUtilisateurDansAsso(asso_id);
                const postsData = await obtenirPublicationsAsso(asso_id);
                setIsMembreAutorise(membreData.autorise);
                setListePosts(postsData.publications);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [asso_id]);

    return (
        <>
            <div className='asso-info-section'>
                <div className='asso-titre-description'>
                    <h2>Les publications</h2>
                    {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => setIsGestion(true)}>
                        <img src="/assets/icons/edit.svg" alt="Copy" />
                        <p id="texteCopier">Éditer</p>
                    </div>}
                </div>
            </div>
            {isGestion && !isNewPost && <div className='buttons-container'>
                <div className='valider-button' onClick={() => setIsNewPost(true)}>
                    <img src="/assets/icons/plus.svg" alt="Ajouter une publications" />
                    <p>Ajouter une publication</p>
                </div>
            </div>}
            <div className='asso-events-container'>

                {/* formulaire pour une nouvelle publication */}
                {isNewPost && <div className='asso-bloc-interne'>
                    <h2><input value={newPost.titre} name='titre' type='text' onChange={handleSetNewPost} /></h2>
                    <p><input value={newPost.contenu} name='contenu' type='text' onChange={handleSetNewPost} /></p>
                    <p>Autoriser les commentaires : <input type="checkbox" checked={newPost.is_commentable} name='is_commentable' onChange={handleSetNewPost} /></p>
                    <p>Publication interne : <input type="checkbox" checked={newPost.is_publication_interne} name='is_publication_interne' onChange={handleSetNewPost} /></p>
                    <p>
                        Cacher aux cycles :
                        {/* TODO : A FINIR */}
                        {["ic", "ast", "ev", "vs", "isup"].map(day => (
                            <label key={day}>
                                <input type="checkbox" name="jours_de_la_semaine" value={day} checked={modifierEventTempsPeriodique.jours_de_la_semaine.includes(day)} onChange={handleSetModifierEventTempsPeriodique} />
                                {day}
                            </label>
                        ))}
                    </p>
                    {isNewPost && <div className='buttons-container'>
                        <div className='valider-button' onClick={validateNewPost}>
                            <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                            <p>Ajouter</p>
                        </div>
                        <div className='annuler-button' onClick={() => setIsNewEvent(false)}>
                            <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                            <p>Annuler</p>
                        </div>
                    </div>}
                </div>}

                {/* Les publications existantes */}
                {listePosts.map((post) => (<div key={post.id} className='asso-bloc-interne'>
                    <h2>{post.titre}</h2>
                    <p>{post.contenu}</p>
                    {isGestion && <div className='buttons-container'>
                        <div className='asso-button' onClick={() => console.log(post.id)}>
                            <img src="/assets/icons/edit.svg" alt="Editer" />
                            <p>Editer</p>
                        </div>
                        <div className='annuler-button' onClick={() => removePost(post.id)}>
                            <img src="/assets/icons/delete.svg" alt="Supprimer" />
                            <p>Supprimer</p>
                        </div>
                    </div>}
                </div>))}
            </div>
        </>
    )
}

export default AssoPosts;