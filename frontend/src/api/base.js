// Configuration de base pour l'api

export const BASE_URL = "http://localhost:5000"
export const API_BASE_URL = `${BASE_URL}/api`;
export const SOIFGUARD_BASE_URL = `${API_BASE_URL}/soifguard`;
export const CHAT_BASE_URL = `${BASE_URL}`

export async function handleResponse(response) {
  if (!response.ok) {
    const errorMessage = await response.json();
    console.error("Erreur API :", errorMessage.message || "Erreur inconnue");
    throw new Error(errorMessage.message || "Erreur inconnue");
  }
  return response.json();
}