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