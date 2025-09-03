import React, { useEffect, useState } from "react";
import { chargerAsso, estUtilisateurDansAsso } from "../../api/api_associations";
import { obtenirPublicationsAsso } from "../../api/api_publications";

function AssoPosts({ asso_id }) {
    const [isEdition, setIsEdition] = useState(false);
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);
    const [listePosts, setListePosts] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const asso = await chargerAsso(asso_id);
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
                    {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => setIsEdition(true)}>
                        <img src="/assets/icons/edit.svg" alt="Copy" />
                        <p id="texteCopier">Éditer</p>
                    </div>}
                </div>
            </div>
            <div className='asso-events-container'>
                {listePosts.map((post) => (<div key={post.id} className='asso-bloc-interne'>
                    <p>{post.titre}</p>
                    <p>{post.contenu}</p>
                </div>))}
            </div>
        </>
    )
}

export default AssoPosts;