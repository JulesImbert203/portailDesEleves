import { API_BASE_URL, handleResponse } from "./base";

export async function ajouterAsso(nom, description, type_association, ordre_importance, logo_path, banniere_path, a_cacher_aux_nouveaux) {
  try {
    const response = await fetch(`${API_BASE_URL}/associations/route_creer_asso`, {
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
        a_cacher_aux_nouveaux,
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
    const res = await fetch(`${API_BASE_URL}/associations/${asso_id}/editer_description`, {
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
    const res = await fetch(`${API_BASE_URL}/associations/${associationId}/ajouter_membre/${membreId}`, {
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
    const res = await fetch(`${API_BASE_URL}/associations/${associationId}/retirer_membre/${membreId}`, {
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
    const res = await fetch(`${API_BASE_URL}/associations/${associationId}/modifier_role_membre/${membreId}`, {
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
    const res = await fetch(`${API_BASE_URL}/associations/${associationId}/modifier_position_membre/${membreId}`, {
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

export async function ajouterContenu(associationId, file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/associations/${associationId}/add_content`, {
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
    await fetch(`${API_BASE_URL}/associations/${asso_id}/modifier_logo_banniere/${photo_type}/${new_name}`, {
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
  const res = await fetch(`${API_BASE_URL}/associations/route_est_membre_de_asso/${asso_id}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function chargerAsso(asso_id) {
  const res = await fetch(`${API_BASE_URL}/associations/${asso_id}`,
    { credentials: "include" }
  );
  const data = await res.json();
  return data;
}

export async function chargerListeAssos() {
  try {
    const res = await fetch(`${API_BASE_URL}/associations/assos`,
      { credentials: "include" }
    );
    return handleResponse(res);
  } catch (error) {
    console.error("Erreur réseau :", error);
  }
}