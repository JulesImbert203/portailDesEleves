import { API_BASE_URL, handleResponse } from "./base";

export async function obtenirPublicationsAsso(asso_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/obtenir_publications_asso/${asso_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur)
    throw erreur;
  }
}

export async function supprimerPublication(asso_id, publication_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/${asso_id}/supprimer_publication/${publication_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur)
    throw erreur;
  }
}

export async function supprimerCommentaire(comment_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/supprimer_commentaire/${comment_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur)
    throw erreur;
  }
}

export async function creerNouvellePublication(id_asso, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/${id_asso}/creer_nouvelle_publication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data)
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}

export async function modifierPublication(id_asso, id_post, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/${id_asso}/modifier_publication/${id_post}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data)
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}

export async function modifierCommentaire(id_comment, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/modifier_commentaire/${id_comment}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data)
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}

export async function modifierLikePost(id_post) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/modifier_like_post/${id_post}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}

export async function modifierLikeComment(id_comment) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/modifier_like_comment/${id_comment}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}

export async function creerNouveauCommentaire(id_post, comment) {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/${id_post}/creer_nouveau_commentaire`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({"contenu" : comment})
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}