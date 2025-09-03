import { API_BASE_URL, handleResponse } from "./base";

export async function creerNouvelEvenement(id_asso, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/evenements/${id_asso}/creer_nouvel_evenement`, {
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

export async function modifierEvenement(id_asso, id_event, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/evenements/${id_asso}/modifier_evenement/${id_event}`, {
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

export async function supprimerEvenement(id_asso, id_event) {
  try {
    const res = await fetch(`${API_BASE_URL}/evenements/${id_asso}/supprimer_evenement/${id_event}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }

}

export async function obtenirEvenementsAsso(id_asso) {
  try {
    const res = await fetch(`${API_BASE_URL}/evenements/obtenir_evenements_asso/${id_asso}`, {
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