// Configuration de base pour l'api

export const API_BASE_URL = "http://localhost:5000/api";
export const SOIFGUARD_BASE_URL = `${API_BASE_URL}/soifguard`;


export async function handleResponse(response) {
  if (!response.ok) {
    const errorMessage = await response.json();
    console.error("Erreur API :", errorMessage.message || "Erreur inconnue");
    throw new Error(errorMessage.message || "Erreur inconnue");
  }
  return response.json();
}