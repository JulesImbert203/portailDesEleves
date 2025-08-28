// api.js 
// aide a interagir avec le backend flask

export async function estAuthentifie() {
  const res = await fetch("http://localhost:5000/est_auth", { credentials: "include" });
  const data = await res.json();
  return data.etat_connexion; // Flask renvoie { "etat_connexion": true/false }
}

export async function obtenirIdUser() {
  const res = await fetch("http://localhost:5000/current_user_id", { credentials: "include" });
  const data = await res.json();
  return data.id_utilisateur; // Flask renvoie { "id_utilisateur": int ou None si on connecte, ...}
}

export async function obtenirDataUser(id_utilisateur) {
  const res = await fetch(`http://localhost:5000/api/users/obtenir_infos_profil/${id_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}

export async function seDeconnecter() {
  await fetch("http://localhost:5000/deconnexion", {
    method: "POST",
    credentials: "include"
  });
}

export async function seConnecter(username, password) {
  const res = await fetch("http://localhost:5000/connexion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important pour gérer les cookies de session
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  return data.connecte; // Flask renvoie { "connecte": true/false }
}

export async function obtenirSondageDuJour() {
  const res = await fetch(`http://localhost:5000/api/sondages/sondage_du_jour`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}


export async function requeteProposerSondage(question, reponses) {
  const res = await fetch("http://localhost:5000/api/sondages/route_proposer_sondage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Si tu utilises des cookies de session
    body: JSON.stringify({ question, reponses })
  });

  const data = await res.json(); // Récupère la réponse JSON de l'API
  return data;
}

export async function obtenirSondagesEnAttente() {
  const res = await fetch(`http://localhost:5000/api/sondages/route_obtenir_sondages_en_attente`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}

export async function validerSondage(id_sondage) {
  await fetch(`http://localhost:5000/api/sondages/route_valider_sondage/${id_sondage}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });
}

export async function supprimerSondage(id_sondage) {
  await fetch(`http://localhost:5000/api/sondages/route_supprimer_sondage/${id_sondage}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });
}

export async function sondageSuivant() {
  try {
    const response = await fetch(`http://localhost:5000/api/sondages/sondage_suivant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!response.ok) { // Si la réponse n'est pas 200, c'est une erreur
      const errorData = await response.json();
      console.error("Erreur :", errorData.message);
      // Afficher l'erreur dans l'interface utilisateur si nécessaire
      alert(`Erreur : ${errorData.message}`);
    } else {
      const data = await response.json();
      console.log("Sondage suivant :", data.message);  // Affiche "success" si ça fonctionne
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    // Afficher l'erreur dans l'interface utilisateur si nécessaire
    alert(`Erreur réseau : ${error.message}`);
  }
}


export async function voterSondage(id_vote) {
  await fetch(`http://localhost:5000/api/sondages/route_voter_sondage/${id_vote}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });
}

// SOIFGUARD :

const SOIFGUARD_BASE_URL = "http://localhost:5000/api/soifguard";

async function handleResponse(response) {
  if (!response.ok) {
    const errorMessage = await response.json();
    console.error("Erreur API :", errorMessage.message || "Erreur inconnue");
    throw new Error(errorMessage.message || "Erreur inconnue");
  }
  return response.json();
}

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
    const response = await fetch(`http://localhost:5000/api/soifguard/liste_consos/${asso}`, {
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
    const response = await fetch("http://localhost:5000/api/soifguard/verifier_permission", {
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
    const response = await fetch("http://localhost:5000/api/soifguard/ajouter_permission", {
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
    const response = await fetch('http://localhost:5000/api/soifguard/get_permissions_soifguard', {
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


export async function verifierSuperutilisateur() {
  try {
    const response = await fetch("http://localhost:5000/api/users/verifier_superutilisateur", {
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
  const res = await fetch(`http://localhost:5000/api/users/obtenir_id_par_nomutilisateur/${nom_utilisateur}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // au format JSON 
}

export async function chargerUtilisateursParPromo(promo) {
  const res = await fetch(`http://localhost:5000/api/users/charger_utilisateurs_par_promo/${promo}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data; // Retourne la liste des utilisateurs au format JSON
}

export async function switchCotisationOcto(idUtilisateur) {
  try {
    await fetch(`http://localhost:5000/api/soifguard/switch_cotisation_octo/${idUtilisateur}`, {
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
    await fetch(`http://localhost:5000/api/soifguard/switch_cotisation_biero/${idUtilisateur}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (error) {
    console.error("Erreur lors du changement de cotisation Biero :", error);
  }
}

export async function obtenirDetteMaxi(asso) {
  const res = await fetch(`http://localhost:5000/api/soifguard/get_negatif_max/${asso}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function ajouterAsso(nom, description, type_association, ordre_importance, logo_path, banniere_path) {
  try {
    const response = await fetch("http://localhost:5000/api/associations/route_creer_asso", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        nom,
        description,
        type_association,
        ordre_importance,
        logo_path,
        banniere_path,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'ajout de l'association");
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Erreur réseau :", error);
    return { success: false, message: error.message };
  }
}

export async function modifierDescriptionAsso(asso_id, new_desc) {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/${asso_id}/editer_description`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ new_desc })
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Erreur lors de la modification de la description : ", error);
    throw error;
  }
}

export async function ajouterMembre(associationId, membreId) {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/${associationId}/ajouter_membre/${membreId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
    return handleResponse(res);
  }
  catch (error) {
    console.error("Erreur réseau :", error);
    throw error;
  }
}

export async function retirerMembre(associationId, membreId) {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/${associationId}/retirer_membre/${membreId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
    return handleResponse(res);
  }
  catch (error) {
    console.error("Erreur réseau :", error);
    throw error;
  }
}

export async function modifierRoleMembre(associationId, membreId, role) {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/${associationId}/modifier_role_membre/${membreId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role })
    })
    return handleResponse(res);
  }
  catch (error) {
    console.error("Erreur réseau :", error);
    throw error;
  }
}

export async function modifierPositionMembre(associationId, membreId, position) {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/${associationId}/modifier_position_membre/${membreId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ position })
    })
    return handleResponse(res);
  } catch (erreur) {
    console.error("Erreur réseau :", erreur);
    throw erreur;
  }
}

export async function updateMembersOrder(associationId) {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/${associationId}/update_members_order`, {
      method: "PATCH",
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

export async function ajouterContenu(associationId, file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`http://localhost:5000/api/associations/${associationId}/add_content`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
      credentials: "include",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors du téléversement du fichier");
    }
    return { success: true, message: data.message, filePath: data.file_path };
  } catch (error) {
    console.error("Erreur réseau :", error);
    return { success: false, message: error.message };
  }
}

export async function changerPhoto(asso_id, photo_type, new_name) {
  try {
    await fetch(`http://localhost:5000/api/associations/${asso_id}/modifier_logo_banniere/${photo_type}/${new_name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (error) {
    console.error("Erreur lors du changement de photo :", error);
    throw error;
  }
}

export async function estUtilisateurDansAsso(asso_id) {
  // renvoie True aussi pour le superutilisateur
  const res = await fetch(`http://localhost:5000/api/associations/route_est_membre_de_asso/${asso_id}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function chargerAsso(asso_id) {
  const res = await fetch(`http://localhost:5000/api/associations/${asso_id}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function chargerListeAssos() {
  try {
    const res = await fetch(`http://localhost:5000/api/associations/assos`,
      { credentials: "include" }
    );
    return handleResponse(res);
  } catch (error) {
    console.error("Erreur réseau :", error);
  }
}

export async function obtenirListeDesPromos() {
  const res = await fetch(`http://localhost:5000/api/users/obtenir_liste_des_promos`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function obtenirListeDesUtilisateurs(promo, cycles) {
  let url = `http://localhost:5000/api/users/obtenir_liste_utilisateurs/${promo}`;
  url += `/${cycles.join(",")}`;
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  return data;
}

export async function obtenirListeDesUtilisateursParPromo(promo) {
  let url = `http://localhost:5000/api/users/charger_utilisateurs_par_promo/${promo}`;
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  return data;
}

export async function creerNouvelEvenement(id_asso, data) {
  try {
    const res = await fetch(`http://localhost:5000/api/evenements/${id_asso}/creer_nouvel_evenement`, {
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
    const res = await fetch(`http://localhost:5000/api/evenements/${id_asso}/modifier_evenement/${id_event}`, {
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
    const res = await fetch(`http://localhost:5000/api/evenements/${id_asso}/supprimer_evenement/${id_event}`, {
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
    const res = await fetch(`http://localhost:5000/api/evenements/obtenir_evenements_asso/${id_asso}`, {
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