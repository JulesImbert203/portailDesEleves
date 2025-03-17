import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BlocUtilisateur() {
  const [idUtilisateur, setIdUtilisateur] = useState(null);
  const [dataUtilisateur, setDataUtilisateur] = useState(null);

  // Obtenir l'id de l'utilisateur connecté
  useEffect(() => {
    fetch('http://127.0.0.1:5000/est_auth', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.id_utilisateur) {
          setIdUtilisateur(data.id_utilisateur); // Met à jour idUtilisateur
        }
      })
      .catch(error => {
        console.error("Erreur lors de la récupération de la connexion :", error);
      });
  }, []);

  // Obtenir les infos de l'utilisateur une fois idUtilisateur chargé
  useEffect(() => {
    if (!idUtilisateur) return; // Évite une requête invalide avec idUtilisateur = null

    fetch(`http://127.0.0.1:5000/api/users/obtenir_infos_profil/${idUtilisateur}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setDataUtilisateur(data); // Stocke les infos utilisateur
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des infos utilisateur :", error);
      });
  }, [idUtilisateur]); // Lancer la requête SEULEMENT quand idUtilisateur est disponible

  const deconnecter = () => {
    fetch('http://127.0.0.1:5000/deconnexion', {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => {
        if (response.ok) {
          console.log("Déconnexion réussie");
          // Redirige vers la page de login après la déconnexion
        } else {
          console.error("Erreur lors de la déconnexion");
        }
      })
      .catch(error => {
        console.error("Erreur lors de la déconnexion :", error);
      });
  };

  return (
    <div className="bloc-utilisateur">
      {dataUtilisateur ? (
        <>
          <h2>{dataUtilisateur.nom_utilisateur}</h2>
          <p>{dataUtilisateur.prenom} {dataUtilisateur.nom_de_famille}</p>
          <button onClick={deconnecter}>Se déconnecter</button>
        </>
      ) : (
        <p>Chargement...</p> // Affichage temporaire pour éviter une erreur si dataUtilisateur est null
      )}
    </div>
  );
}

export default BlocUtilisateur;
