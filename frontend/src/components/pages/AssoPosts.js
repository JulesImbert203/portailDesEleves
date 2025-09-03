import React, { useEffect, useState } from "react";
import { estUtilisateurDansAsso } from "../../api/api_associations";
import { obtenirPublicationsAsso, supprimerPublication } from "../../api/api_publications";

function AssoPosts({ asso_id }) {
    const [isGestion, setIsGestion] = useState(false);
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);
    const [listePosts, setListePosts] = useState([])

    const removePost = async (post_id) => {
        try {
            await supprimerPublication(asso_id, post_id);
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
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
            <div className='asso-events-container'>
                {listePosts.map((post) => (<div key={post.id} className='asso-bloc-interne'>
                    <p>{post.titre}</p>
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