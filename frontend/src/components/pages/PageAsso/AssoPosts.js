import React, { useEffect, useState } from "react";
import { estUtilisateurDansAsso } from "../../../api/api_associations";
import { creerNouveauCommentaire, creerNouvellePublication, modifierCommentaire, modifierLikeComment, modifierLikePost, modifierPublication, obtenirPublicationsAsso, supprimerCommentaire, supprimerPublication } from "../../../api/api_publications";
import { useLayout } from "../../../layouts/Layout";
import RichEditor, { RichTextDisplay } from "../../blocs/RichEditor";
import { BASE_URL } from "../../../api/base";

function AssoPosts({ asso_id }) {
    const { userData } = useLayout();
    const [isGestion, setIsGestion] = useState(false);
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);
    const [isNewPost, setIsNewPost] = useState(false);
    const [listePosts, setListePosts] = useState([]);
    const [newPost, setNewPost] = useState({
        "titre": "",
        "contenu": "",
        "is_commentable": true,
        "a_cacher_to_cycles": [],
        "a_cacher_aux_nouveaux": false,
        "is_publication_interne": false
    })
    const [idModifyPost, setIdModifyPost] = useState(null);
    const [modifyPost, setModifyPost] = useState({
        "titre": "",
        "contenu": "",
        "is_commentable": true,
        "a_cacher_to_cycles": [],
        "a_cacher_aux_nouveaux": false,
        "is_publication_interne": false
    })
    const [idModifyComment, setIdModifyComment] = useState(null);
    const [modifyComment, setModifyComment] = useState("");
    const [idNewComment, setIdNewComment] = useState(null);
    const [newComment, setNewComment] = useState("");

    const clearNewPost = () => {
        setNewPost({
            "titre": "",
            "contenu": "",
            "is_commentable": true,
            "a_cacher_to_cycles": [],
            "a_cacher_aux_nouveaux": false,
            "is_publication_interne": false
        })
    }

    const clearModifyPost = () => {
        setModifyPost({
            "titre": "",
            "contenu": "",
            "is_commentable": true,
            "a_cacher_to_cycles": [],
            "a_cacher_aux_nouveaux": false,
            "is_publication_interne": false
        })
    }

    const formatPublicationDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    const handleSetNewPost = (e) => {
        const { name, value, checked } = e.target;
        setNewPost(prevState => {
            if (['is_commentable', 'is_publication_interne', 'a_cacher_aux_nouveaux'].includes(name)) {
                return {
                    ...prevState,
                    [name]: checked
                };
            }
            if (name === 'a_cacher_to_cycles') {
                const currentCycles = newPost.a_cacher_to_cycles;
                const updatedCycles = checked ? [...currentCycles, value] : currentCycles.filter(cycle => cycle !== value);
                return {
                    ...prevState,
                    [name]: updatedCycles
                };
            }
            return {
                ...prevState,
                [name]: value
            };
        });
    };

    const handleSetNewPostContent = (value) => {
        setNewPost(prevState => ({
            ...prevState,
            contenu: value,
        }))
    }

    const handleSetModifyPost = (e) => {
        const { name, value, checked } = e.target;
        setModifyPost(prevState => {
            if (['is_commentable', 'is_publication_interne', 'a_cacher_aux_nouveaux'].includes(name)) {
                return {
                    ...prevState,
                    [name]: checked
                };
            }
            if (name === 'a_cacher_to_cycles') {
                const currentCycles = newPost.a_cacher_to_cycles;
                const updatedCycles = checked ? [...currentCycles, value] : currentCycles.filter(cycle => cycle !== value);
                return {
                    ...prevState,
                    [name]: updatedCycles
                };
            }
            return {
                ...prevState,
                [name]: value
            };
        });
    };

    const handleSetModifyPostContent = (value) => {
        setModifyPost(prevState => ({
            ...prevState,
            contenu: value,
        }))
    }

    const removePost = async (post_id) => {
        try {
            await supprimerPublication(asso_id, post_id);
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const removeComment = async (post_id) => {
        try {
            await supprimerCommentaire(post_id);
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const validateNewPost = async () => {
        try {
            await creerNouvellePublication(asso_id, newPost);
            clearNewPost();
            setIsNewPost(false);
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const handleSetIdNewComment = (comment_id) => {
        if (comment_id !== idNewComment) {
            setNewComment("")
            setIdNewComment(comment_id)
        }
    }

    const validateNewComment = async (post_id) => {
        try {
            await creerNouveauCommentaire(post_id, newComment)
            setNewComment("");
            setIdNewComment(null)
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const handleSetIdModifyPost = async (post_id) => {
        if (idModifyPost !== post_id) {
            clearModifyPost();
            const post = listePosts.find(e => e.id === post_id);
            if (post) {
                const { titre, contenu, is_commentable } = post;
                setModifyPost(prevState => ({ ...prevState, titre, contenu, is_commentable }));
            }
            setIdModifyPost(post_id);
        }
    }

    const handleSetIdModifyComment = async (comment_id) => {
        if (idModifyComment !== comment_id) {
            const postComments = listePosts.flatMap(post => post.commentaires);
            const comment = postComments.find(c => c.id === comment_id);
            if (comment) {
                setModifyComment(comment.contenu);
            }
            setIdModifyComment(comment_id);
        }
    }

    const validateModifyPost = async () => {
        try {
            await modifierPublication(asso_id, idModifyPost, modifyPost);
            clearModifyPost();
            setIdModifyPost(null);
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const validateModifyComment = async () => {
        try {
            await modifierCommentaire(idModifyComment, { "contenu": modifyComment })
            setModifyComment("")
            setIdModifyComment(null)
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const handleChangePostLike = async (post_id) => {
        try {
            await modifierLikePost(post_id)
            const postsData = await obtenirPublicationsAsso(asso_id);
            setListePosts(postsData.publications);
        } catch (erreur) {
            console.error(erreur);
        }
    }

    const handleChangeCommentLike = async (comment_id) => {
        try {
            await modifierLikeComment(comment_id)
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
                    {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => setIsGestion(!isGestion)}>
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
            <div className='asso-content-container'>

                {/* formulaire pour une nouvelle publication */}
                {isNewPost && <div className='asso-bloc-interne'>
                    <h2>Titre : <input value={newPost.titre} name='titre' type='text' onChange={handleSetNewPost} /></h2>
                    <p>Autoriser les commentaires : <input type="checkbox" checked={newPost.is_commentable} name='is_commentable' onChange={handleSetNewPost} /></p>
                    <p>Publication interne : <input type="checkbox" checked={newPost.is_publication_interne} name='is_publication_interne' onChange={handleSetNewPost} /></p>
                    <p>Cacher aux 1A : <input type="checkbox" checked={newPost.a_cacher_aux_nouveaux} name='a_cacher_aux_nouveaux' onChange={handleSetNewPost} /></p>
                    <p>
                        Cacher aux cycles :
                        {["ic", "ast", "ev", "vs", "isup"].map(cycle => (
                            <label key={cycle}>
                                <input type="checkbox" name="a_cacher_to_cycles" value={cycle} checked={newPost.a_cacher_to_cycles.includes(cycle)} onChange={handleSetNewPost} />
                                {cycle}
                            </label>
                        ))}
                    </p>
                    <p>Description :</p>
                    <RichEditor value={newPost.contenu} onChange={handleSetNewPostContent} />
                    <div className='buttons-container'>
                        <div className='valider-button' onClick={validateNewPost}>
                            <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                            <p>Ajouter</p>
                        </div>
                        <div className='annuler-button' onClick={() => setIsNewPost(false)}>
                            <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                            <p>Annuler</p>
                        </div>
                    </div>
                </div>}

                {listePosts.map((post) =>
                    <div key={post.id} className='asso-bloc-interne'>

                        {/* Les publications existantes */}
                        {idModifyPost !== post.id && <>
                            <h2>{post.titre}</h2>
                            <RichTextDisplay content={post.contenu} />
                            {!isGestion && <div className='buttons-container'>
                                <div className='asso-button' onClick={() => handleChangePostLike(post.id)}>
                                    {post.likes.includes(userData.id) && <img src="/assets/icons/heart_plain.svg" alt="J'aime" />}
                                    {!post.likes.includes(userData.id) && <img src="/assets/icons/heart.svg" alt="J'aime" />}
                                    <p>{post.likes.length}</p>
                                </div>
                                <div className='asso-button' onClick={() => handleSetIdNewComment(post.id)}>
                                    <img src="/assets/icons/comment.svg" alt="commentaire" />
                                    <p>Commenter</p>
                                </div>
                                <p className="publication-date">Publié le : {formatPublicationDate(post.date_publication)}</p>
                            </div>}
                            {isGestion && <div className='buttons-container'>
                                <div className='asso-button' onClick={() => handleSetIdModifyPost(post.id)}>
                                    <img src="/assets/icons/edit.svg" alt="Editer" />
                                    <p>Editer</p>
                                </div>
                                <div className='annuler-button' onClick={() => removePost(post.id)}>
                                    <img src="/assets/icons/delete.svg" alt="Supprimer" />
                                    <p>Supprimer</p>
                                </div>
                            </div>}

                            {/* Nouveau commentaire */}
                            {idNewComment === post.id && <div className="asso-bloc-comment">
                                <div className="asso-item-comment">
                                    <img src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} alt={`${post.auteur}`} />
                                    <textarea className="comment-input" value={newComment} type='text' placeholder="Écrivez votre commentaire ici" onChange={(e) => setNewComment(e.target.value)} />
                                </div>
                                <div className='buttons-container'>
                                    <div className='valider-button' onClick={() => validateNewComment(post.id)}>
                                        <img src="/assets/icons/check-mark.svg" alt="Valider" />
                                        <p>Valider</p>
                                    </div>
                                    <div className='annuler-button' onClick={() => handleSetIdNewComment(null)}>
                                        <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                                        <p>Annuler</p>
                                    </div>
                                </div>
                            </div>}

                            {post.commentaires.map((comment) => <div className="asso-bloc-comment" key={comment.id}>

                                {/* Les commentaires */}
                                {comment.id !== idModifyComment && <>
                                    <div className="asso-item-comment">
                                        <img src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} alt={`${post.auteur}`} />
                                        <p>{comment.contenu}</p>
                                    </div>
                                    <div className='buttons-container'>
                                        <div className='asso-button' onClick={() => handleChangeCommentLike(comment.id)}>
                                            {comment.likes.includes(userData.id) && <img src="/assets/icons/heart_plain.svg" alt="J'aime" />}
                                            {!comment.likes.includes(userData.id) && <img src="/assets/icons/heart.svg" alt="J'aime" />}
                                            <p>{comment.likes.length}</p>
                                        </div>
                                        {comment.id_auteur === userData.id &&
                                            <div className='asso-button' onClick={() => handleSetIdModifyComment(comment.id)}>
                                                <img src="/assets/icons/edit.svg" alt="Editer" />
                                                <p>Editer</p>
                                            </div>}
                                        {(isGestion || comment.id_auteur === userData.id) && <div className='annuler-button' onClick={() => removeComment(comment.id)}>
                                            <img src="/assets/icons/delete.svg" alt="Supprimer" />
                                            <p>Supprimer</p>
                                        </div>}
                                        <p className="publication-date">Publié le : {formatPublicationDate(comment.date)}</p>
                                    </div>
                                </>}

                                {/* commentaire en cours d'édition */}
                                {comment.id === idModifyComment && <>
                                    <div className="asso-item-comment">
                                        <img src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} alt={`${post.auteur}`} />
                                        <textarea className="comment-input" value={modifyComment} type='text' placeholder="Écrivez votre commentaire ici" onChange={(e) => setModifyComment(e.target.value)} />
                                    </div>
                                    <div className='buttons-container'>
                                        <div className='valider-button' onClick={() => validateModifyComment(comment.id)}>
                                            <img src="/assets/icons/check-mark.svg" alt="Valider" />
                                            <p>Valider</p>
                                        </div>
                                        <div className='annuler-button' onClick={() => handleSetIdModifyComment(null)}>
                                            <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                                            <p>Annuler</p>
                                        </div>
                                    </div>
                                </>}
                            </div>)}
                        </>}

                        {/* Publication en cours d'édition */}
                        {idModifyPost === post.id &&
                            <>
                                <h2>Titre : <input value={modifyPost.titre} name='titre' type='text' onChange={handleSetModifyPost} /></h2>
                                <p>Autoriser les commentaires : <input type="checkbox" checked={modifyPost.is_commentable} name='is_commentable' onChange={handleSetModifyPost} /></p>
                                <p>Publication interne : <input type="checkbox" checked={modifyPost.is_publication_interne} name='is_publication_interne' onChange={handleSetModifyPost} /></p>
                                <p>Cacher aux 1A : <input type="checkbox" checked={modifyPost.a_cacher_aux_nouveaux} name='a_cacher_aux_nouveaux' onChange={handleSetModifyPost} /></p>
                                <p>
                                    Cacher aux cycles :
                                    {["ic", "ast", "ev", "vs", "isup"].map(cycle => (
                                        <label key={cycle}>
                                            <input type="checkbox" name="a_cacher_to_cycles" value={cycle} checked={modifyPost.a_cacher_to_cycles.includes(cycle)} onChange={handleSetModifyPost} />
                                            {cycle}
                                        </label>
                                    ))}
                                </p>
                                <p>Description :</p>
                                <RichEditor value={modifyPost.contenu} onChange={handleSetModifyPostContent} />
                                <div className='buttons-container'>
                                    <div className='valider-button' onClick={validateModifyPost}>
                                        <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                                        <p>Ajouter</p>
                                    </div>
                                    <div className='annuler-button' onClick={() => setIdModifyPost(null)}>
                                        <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                                        <p>Annuler</p>
                                    </div>
                                </div>
                            </>}
                    </div>
                )}
            </div>
        </>
    )
}

export default AssoPosts;