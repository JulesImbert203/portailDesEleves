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