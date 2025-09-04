import { API_BASE_URL, handleResponse } from "./base";

export async function obtenirDataUser(id_utilisateur) {
  const res = await fetch(`${API_BASE_URL}/users/obtenir_infos_profil/${id_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}

export async function verifierSuperutilisateur() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/verifier_superutilisateur`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Erreur lors de la vérification :", data.message);
      return { is_superuser: false, message: data.message };
    }
    return { is_superuser: data.is_superuser };
  } catch (error) {
    console.error("Erreur réseau :", error);
    return { is_superuser: false, message: "Erreur réseau" };
  }
}

export async function obtenirIdUserParNom(nom_utilisateur) {
  const res = await fetch(`${API_BASE_URL}/users/obtenir_id_par_nomutilisateur/${nom_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}

export async function chargerUtilisateursParPromo(promo) {
  const res = await fetch(`${API_BASE_URL}/users/charger_utilisateurs_par_promo/${promo}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // Retourne la liste des utilisateurs au format JSON
}

export async function obtenirListeDesPromos() {
  const res = await fetch(`${API_BASE_URL}/users/obtenir_liste_des_promos`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function obtenirListeDesUtilisateurs(promo, cycles) {
  let url = `${API_BASE_URL}/users/obtenir_liste_utilisateurs/${promo}`;
  url += `/${cycles.join(",")}`;
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  return data;
}

export async function obtenirListeDesUtilisateursParPromo(promo) {
  let url = `${API_BASE_URL}/users/charger_utilisateurs_par_promo/${promo}`;
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  return data;
}