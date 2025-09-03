import { SOIFGUARD_BASE_URL, handleResponse } from "./base";


export async function encaisserOcto(id_utilisateur, id_conso) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/encaisser_octo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_utilisateur, id_conso }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function encaisserBiero(id_utilisateur, id_conso) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/encaisser_biero`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_utilisateur, id_conso }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function crediterOcto(id_utilisateur, somme) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/crediter_octo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_utilisateur, somme }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function crediterBiero(id_utilisateur, somme) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/crediter_biero`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_utilisateur, somme }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function fixerNegatifMaximumOcto(maximum) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/fixer_negatif_maximum_octo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ maximum }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function fixerNegatifMaximumBiero(maximum) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/fixer_negatif_maximum_biero`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ maximum }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function ajouterConsoOcto(nom_conso, prix, prix_cotisant) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/ajouter_conso_octo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nom_conso, asso: "octo", prix, prix_cotisant }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function ajouterConsoBiero(nom_conso, prix, prix_cotisant) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/ajouter_conso_biero`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nom_conso, asso: "biero", prix, prix_cotisant }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function supprimerConsoOcto(id_conso) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/supprimer_conso_octo`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_conso }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function supprimerConsoBiero(id_conso) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/supprimer_conso_biero`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_conso }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function modifierPrixConsoOcto(id_conso, nouveau_prix, nouveau_prix_cotisant) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/modifier_prix_conso_octo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_conso, nouveau_prix, nouveau_prix_cotisant }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}

export async function modifierPrixConsoBiero(id_conso, nouveau_prix, nouveau_prix_cotisant) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/modifier_prix_conso_biero`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_conso, nouveau_prix, nouveau_prix_cotisant }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
  }
}


export async function getListeConsos(asso = "octo") {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/liste_consos/${asso}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des consos :", error);
  }
}

export async function verifierPermission(asso) {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/verifier_permission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ asso })
    });
    const data = await response.json();
    return data.has_permission;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

export async function ajouterPermission(id_utilisateur, asso = "octo") {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/ajouter_permission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id_utilisateur, asso }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Erreur lors de l'ajout de la permission :", data.message);
      return { success: false, message: data.message };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Erreur réseau :", error);
    return { success: false, message: "Erreur réseau" };
  }
}

export async function obtenirPermissionsSoifguard() {
  try {
    const response = await fetch(`${SOIFGUARD_BASE_URL}/get_permissions_soifguard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Assurez-vous que vous avez les bonnes permissions pour l'appel
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des permissions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    return [];
  }
}


export async function switchCotisationOcto(idUtilisateur) {
  try {
    await fetch(`${SOIFGUARD_BASE_URL}/switch_cotisation_octo/${idUtilisateur}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (error) {
    console.error("Erreur lors du changement de cotisation Octo :", error);
  }
}

export async function switchCotisationBiero(idUtilisateur) {
  try {
    await fetch(`${SOIFGUARD_BASE_URL}/switch_cotisation_biero/${idUtilisateur}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (error) {
    console.error("Erreur lors du changement de cotisation Biero :", error);
  }
}

export async function obtenirDetteMaxi(asso) {
  const res = await fetch(`${SOIFGUARD_BASE_URL}/get_negatif_max/${asso}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}