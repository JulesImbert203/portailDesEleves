// api.js 
// aide a interagir avec le backend flask

export async function estAuthentifie() {
    const res = await fetch("http://localhost:5000/est_auth", { credentials: "include" });
    const data = await res.json();
    return data.etat_connexion; // Flask renvoie { "etat_connexion": true/false , ...}
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
  
