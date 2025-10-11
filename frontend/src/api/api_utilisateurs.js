import { API_BASE_URL, handleResponse } from "./base";


export async function obtenirAssosUtilisateur(id_utilisateur) {
  const res = await fetch(`${API_BASE_URL}/users/assos_utilisateur/${id_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON
}

export async function obtenirIDActuel() {
  const res = await fetch(`${API_BASE_URL}/users/id_actuel`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data["id"]; 
}

export async function obtenirDataUser(id_utilisateur) {
  const res = await fetch(`${API_BASE_URL}/users/obtenir_infos_profil/${id_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}


export async function obtenirQuestionsReponses(id_utilisateur) {
  const res = await fetch(`${API_BASE_URL}/users/questions_reponses/${id_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}

export async function modifierQuestionsReponses(id_utilisateur, new_QR) {
  await fetch(`${API_BASE_URL}/users/questions_reponses/${id_utilisateur}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(new_QR)
  });
}

export async function modifierInfos(id_utilisateur, new_info) {
  await fetch(`${API_BASE_URL}/users/infos/${id_utilisateur}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(new_info)
  });
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


export async function obtenirProchainsAnnivs() {
  let url = `${API_BASE_URL}/users/prochains_anniv`;
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  return data;
}

export async function selectionnerFillots(fillots_ids) {
  const response = await fetch(`${API_BASE_URL}/users/select_fillots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ fillots_ids: fillots_ids }),
  });
  return handleResponse(response);
}

export async function changerMarrain(marrain_id, fillot_id) {
  const response = await fetch(`${API_BASE_URL}/users/changer_marrain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ marrain_id: marrain_id, fillot_id: fillot_id }),
  });
  return handleResponse(response);
}

export async function supprimerCo() {
  const response = await fetch(`${API_BASE_URL}/users/supprimer_co`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}