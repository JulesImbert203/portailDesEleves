import React, { useEffect, useState } from "react";
import { estUtilisateurDansAsso } from "../../../api/api_associations";
import { creerNouveauCommentaire, creerNouvellePublication, modifierCommentaire, modifierLikeComment, modifierLikePost, modifierPublication, obtenirPublicationsAsso, supprimerCommentaire, supprimerPublication } from "../../../api/api_publications";
import { useLayout } from "../../../layouts/Layout";
import RichEditor, { RichTextDisplay } from "../../blocs/RichEditor";
import { BASE_URL } from "../../../api/base";
import { Card, Button, Form, Row, Col, Image } from "react-bootstrap";
import BoutonEditer from "../../elements/BoutonEditer";

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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Les publications</h2>
                {isMembreAutorise && <BoutonEditer onClick={() => setIsGestion(!isGestion)}/>}
            </div>
            {isGestion && !isNewPost && <div className="d-flex gap-2 mb-3">
                <Button variant="success" onClick={() => setIsNewPost(true)}>
                    <img src="/assets/icons/plus.svg" alt="Ajouter une publication" />
                    Ajouter une publication
                </Button>
            </div>}
            <div className="d-flex flex-column gap-3">

                {/* formulaire pour une nouvelle publication */}
                {isNewPost && <Card>
                    <Card.Body>
                        <Form>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="2">Titre</Form.Label>
                                <Col sm="10">
                                    <Form.Control value={newPost.titre} name='titre' type='text' onChange={handleSetNewPost} />
                                </Col>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check type="checkbox" label="Autoriser les commentaires" checked={newPost.is_commentable} name='is_commentable' onChange={handleSetNewPost} />
                                <Form.Check type="checkbox" label="Publication interne" checked={newPost.is_publication_interne} name='is_publication_interne' onChange={handleSetNewPost} />
                                <Form.Check type="checkbox" label="Cacher aux 1A" checked={newPost.a_cacher_aux_nouveaux} name='a_cacher_aux_nouveaux' onChange={handleSetNewPost} />
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="2">Cacher aux cycles</Form.Label>
                                <Col sm="10">
                                    {["ic", "ast", "ev", "vs", "isup"].map(cycle => (
                                        <Form.Check inline key={cycle} type="checkbox" name="a_cacher_to_cycles" value={cycle} label={cycle} checked={newPost.a_cacher_to_cycles.includes(cycle)} onChange={handleSetNewPost} />
                                    ))}
                                </Col>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <RichEditor value={newPost.contenu} onChange={handleSetNewPostContent} />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="success" onClick={validateNewPost}>Ajouter</Button>
                                <Button variant="danger" onClick={() => setIsNewPost(false)}>Annuler</Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>}

                {listePosts.map((post) =>
                    <Card key={post.id}>
                        <Card.Body>
                            {/* Les publications existantes */}
                            {idModifyPost !== post.id && <>
                                <Card.Title>{post.titre}</Card.Title>
                                <RichTextDisplay content={post.contenu} />
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="d-flex gap-2">
                                        {!isGestion && <>
                                            <Button variant="outline-primary" onClick={() => handleChangePostLike(post.id)}>
                                                {post.likes.includes(userData.id) ? <img src="/assets/icons/heart_plain.svg" alt="Je n'aime plus" /> : <img src="/assets/icons/heart.svg" alt="J'aime" />}
                                                {post.likes.length}
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => handleSetIdNewComment(post.id)}>Commenter</Button>
                                        </>}
                                        {isGestion && <>
                                            <Button variant="primary" onClick={() => handleSetIdModifyPost(post.id)}>Éditer</Button>
                                            <Button variant="danger" onClick={() => removePost(post.id)}>Supprimer</Button>
                                        </>}
                                    </div>
                                    <small className="text-muted">Publié le : {formatPublicationDate(post.date_publication)}</small>
                                </div>

                                {/* Nouveau commentaire */}
                                {idNewComment === post.id && <Card className="mt-3">
                                    <Card.Body>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Control as="textarea" rows={3} value={newComment} placeholder="Écrivez votre commentaire ici" onChange={(e) => setNewComment(e.target.value)} />
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button variant="success" onClick={() => validateNewComment(post.id)}>Valider</Button>
                                                <Button variant="danger" onClick={() => handleSetIdNewComment(null)}>Annuler</Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>}

                                {post.commentaires.map((comment) => <Card className="mt-3" key={comment.id}>
                                    <Card.Body>
                                        {comment.id !== idModifyComment && <>
                                            <div className="d-flex align-items-center gap-3">
                                                <Image src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} alt={`${comment.auteur}`} roundedCircle width={50} height={50} />
                                                <p className="mb-0">{comment.contenu}</p>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <div className="d-flex gap-2">
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleChangeCommentLike(comment.id)}>
                                                        {comment.likes.includes(userData.id) ? <img src="/assets/icons/heart_plain.svg" alt="Je n'aime plus" /> : <img src="/assets/icons/heart.svg" alt="J'aime" />}
                                                        {comment.likes.length}
                                                    </Button>
                                                    {comment.id_auteur === userData.id && <Button variant="outline-secondary" size="sm" onClick={() => handleSetIdModifyComment(comment.id)}>Éditer</Button>}
                                                    {(isGestion || comment.id_auteur === userData.id) && <Button variant="outline-danger" size="sm" onClick={() => removeComment(comment.id)}>Supprimer</Button>}
                                                </div>
                                                <small className="text-muted">Publié le : {formatPublicationDate(comment.date)}</small>
                                            </div>
                                        </>}

                                        {comment.id === idModifyComment && <>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Control as="textarea" rows={3} value={modifyComment} placeholder="Écrivez votre commentaire ici" onChange={(e) => setModifyComment(e.target.value)} />
                                                </Form.Group>
                                                <div className="d-flex gap-2">
                                                    <Button variant="success" onClick={() => validateModifyComment(comment.id)}>Valider</Button>
                                                    <Button variant="danger" onClick={() => handleSetIdModifyComment(null)}>Annuler</Button>
                                                </div>
                                            </Form>
                                        </>}
                                    </Card.Body>
                                </Card>)}
                            </>}

                            {/* Publication en cours d'édition */}
                            {idModifyPost === post.id &&
                                <Form>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Titre</Form.Label>
                                        <Col sm="10">
                                            <Form.Control value={modifyPost.titre} name='titre' type='text' onChange={handleSetModifyPost} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Check type="checkbox" label="Autoriser les commentaires" checked={modifyPost.is_commentable} name='is_commentable' onChange={handleSetModifyPost} />
                                        <Form.Check type="checkbox" label="Publication interne" checked={modifyPost.is_publication_interne} name='is_publication_interne' onChange={handleSetModifyPost} />
                                        <Form.Check type="checkbox" label="Cacher aux 1A" checked={modifyPost.a_cacher_aux_nouveaux} name='a_cacher_aux_nouveaux' onChange={handleSetModifyPost} />
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="2">Cacher aux cycles</Form.Label>
                                        <Col sm="10">
                                            {["ic", "ast", "ev", "vs", "isup"].map(cycle => (
                                                <Form.Check inline key={cycle} type="checkbox" name="a_cacher_to_cycles" value={cycle} label={cycle} checked={modifyPost.a_cacher_to_cycles.includes(cycle)} onChange={handleSetModifyPost} />
                                            ))}
                                        </Col>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <RichEditor value={modifyPost.contenu} onChange={handleSetModifyPostContent} />
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button variant="success" onClick={validateModifyPost}>Valider</Button>
                                        <Button variant="danger" onClick={() => setIdModifyPost(null)}>Annuler</Button>
                                    </div>
                                </Form>}
                        </Card.Body>
                    </Card>
                )}
            </div>
        </>
    )
}

export default AssoPosts;