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
      {credentials: "include"}
    );
    const data = await res.json();
    return data; // au format JSON 
  }
  
export async function seDeconnecter() {
    await fetch("http://localhost:5000/deconnexion", { 
        method: "POST",
        credentials: "include" });
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
      {credentials: "include"}
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
    return data ;
  }
  
  export async function obtenirSondagesEnAttente() {
    const res = await fetch(`http://localhost:5000/api/sondages/route_obtenir_sondages_en_attente`,
      {credentials: "include"}
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

 
  