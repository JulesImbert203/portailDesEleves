import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getListeConsos, 
  ajouterConsoOcto, 
  ajouterConsoBiero, 
  switchCotisationOcto, 
  switchCotisationBiero, 
  supprimerConsoOcto,
  supprimerConsoBiero,
  obtenirDetteMaxi,
  encaisserBiero,
  encaisserOcto,
  verifierPermission
  //modifierPrixConsoOcto,
  //modifierPrixConsoBiero,
} from "../api/api_soifguard";
import {
  chargerUtilisateursParPromo, 
} from "../api/api_utilisateurs"
import "../assets/styles/soifguard.css";

export default function SoifGuard() {
  const navigate = useNavigate();
  const [consos, setConsos] = useState([]);
  const [categorie, setCategorie] = useState("");
  const [promo, setPromo] = useState("");
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [gestionCotisations, setGestionCotisations] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomConso, setNomConso] = useState("");
  const [prix, setPrix] = useState("");
  const [prixCotisant, setPrixCotisant] = useState("");
  const [gestionConsos, setGestionConsos] = useState(false);
  // affichage de la dette
  const [detteMaxiOcto, setDetteMaxiOcto] = useState(null);
  const [detteMaxiBiero, setDetteMaxiBiero] = useState(null);
  // Encaissement
  // Etat pour l'utilisateur sélectionné
  const [selectedUser, setSelectedUser] = useState(null);  
  // pour la conso
  const [selectedConso, setSelectedConso] = useState(null); // Etat pour la consommation sélectionnée

  // pour les permissions de lancer octo ou biero
  const [octoPermission, setOctoPermission] = useState(false);
  const [bieroPermission, setBieroPermission] = useState(false);

  

  // Fonction pour charger les valeurs des dettes maximales
  // La modification de cette dette se fera dans un menu à part pour administrer l'association
  const chargerDetteMaxi = async () => {
    const detteOcto = await obtenirDetteMaxi("octo");
    const detteBiero = await obtenirDetteMaxi("biero");
    setDetteMaxiOcto(detteOcto.max);
    setDetteMaxiBiero(detteBiero.max);
  };

  // Charger les utilisateurs d'une promo
  const chargerUtilisateurs = async () => {
    if (!promo) return;
    const data = await chargerUtilisateursParPromo(promo);
    setUtilisateurs(data);
  };
  
 
  
  // Fonction pour jouer le son
  const jouerSon = () => {
    const audio = new Audio("/assets/sons/encaisser.mp3");
    audio.play();
  };

  // Verification des permissions pour lancer octo ou biero
  useEffect(() => {
      async function checkPermissions() {
        const octo = await verifierPermission("octo");
        const biero = await verifierPermission("biero");
        setOctoPermission(octo);
        setBieroPermission(biero);
      }
      checkPermissions();
    }, []);

  // Appel de la fonction lors du chargement du composant
  useEffect(() => {
    chargerDetteMaxi(); // Charger la dette maximale à l'initialisation
  }, []); // Vide, donc s'exécute une seule fois au montage du composant

  // gestion de selections
  const handleSelectUser = (userId) => {
    setSelectedUser(userId); // Met à jour l'utilisateur sélectionné
  };
  const handleSelectConso = (consoId) => {
    setSelectedConso(consoId); // Met à jour la conso sélectionnée
  };
  
  
  useEffect(() => {
    // Vérifie si un utilisateur et une conso sont sélectionnés
    const encaisserEtRafraichir = async () => {
      if (selectedUser && selectedConso) { 
        // Encaissement
        if (categorie === 'octo') {
          await encaisserOcto(selectedUser, selectedConso);
          jouerSon();
        } else if (categorie === 'biero') {
          await encaisserBiero(selectedUser, selectedConso);
          jouerSon();
        }
  
        setSelectedUser(null);
        setSelectedConso(null);
  
        // Recharger les utilisateurs après l'encaissement
        const data = await chargerUtilisateursParPromo(promo);
        console.log("Utilisateurs mis à jour :", data); // DEBUG
        setUtilisateurs(data);
      }
    };
  
    encaisserEtRafraichir();
  }, [selectedUser, selectedConso, categorie, promo]); 
  
  

  // Charger les consos
  const chargerConsos = async (type) => {
    setCategorie(type);
    const data = await getListeConsos(type);
    setConsos(data.consos || []);
  };

  

  // Toggle cotisation et mise à jour immédiate de l'affichage
  const toggleCotisation = async (idUtilisateur, estCotisant) => {
    if (categorie === "octo") {
      await switchCotisationOcto(idUtilisateur);
    } else if (categorie === "biero") {
      await switchCotisationBiero(idUtilisateur);
    }

    // Met à jour directement l'affichage localement
    setUtilisateurs((prevUtilisateurs) =>
      prevUtilisateurs.map((user) =>
        user.id === idUtilisateur
          ? { ...user, [`est_cotisant_${categorie}`]: !estCotisant }
          : user
      )
    );
  };

  // Ajout d'une conso
  const ajouterConso = async () => {
    if (!nomConso || !prix) return alert("Veuillez remplir tous les champs obligatoires.");
    
    const prixCotisantValue = prixCotisant === "" ? null : parseFloat(prixCotisant);
    const prixValue = parseFloat(prix);

    if (categorie === "octo") {
      await ajouterConsoOcto(nomConso, prixValue, prixCotisantValue);
    } else if (categorie === "biero") {
      await ajouterConsoBiero(nomConso, prixValue, prixCotisantValue);
    }

    // Recharge la liste des consos après l'ajout
    chargerConsos(categorie);
    setIsModalOpen(false);
    setNomConso("");
    setPrix("");
    setPrixCotisant("");
  };

  const supprimerConso = async (id_conso) => {
    if (categorie === "octo") {
      await supprimerConsoOcto(id_conso);
    } else if (categorie === "biero") {
      await supprimerConsoBiero(id_conso);
    }
  
    // Recharge la liste des consos après suppression
    chargerConsos(categorie);
  };

  
  return (
    <div className="soifguard-container">
      {/* HEADER */}
      <div className="header">
        <button onClick={() => navigate("/direction")}>Retour au portail</button>
        <h1>SoifGuard</h1>

        {categorie === "octo" ? (
          detteMaxiOcto !== null ? (
            <p>Dette maximale autorisée : {detteMaxiOcto}€</p>
          ) : (
            <p>Aucun plafond de dette</p>
          )
        ) : null}

        {categorie === "biero" ? (
          detteMaxiBiero !== null ? (
            <p>Dette maximale autorisée : {detteMaxiBiero}€</p>
          ) : (
            <p>Aucun plafond de dette</p>
          )
        ) : null}

      <div className="header-buttons">
        {/* Bouton Octo : affiché seulement si l'utilisateur a la permission */}
        {octoPermission && (
          <button 
            onClick={() => chargerConsos("octo")} 
            className={categorie === "octo" ? "octo-active" : ""}
          >
            Octo
          </button>
        )}

        {/* Bouton Biero : affiché seulement si l'utilisateur a la permission */}
        {bieroPermission && (
          <button 
            onClick={() => chargerConsos("biero")} 
            className={categorie === "biero" ? "biero-active" : ""}
          >
            Biero
          </button>
        )}
      </div>

        
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="main-content">
        {/* SECTION GAUCHE - Utilisateurs */}
        <div className="left-section">
          {/* Sous-header du bloc utilisateurs */}
          <div className="soifguard-user-header">
            {!gestionCotisations && (
              <select onChange={(e) => setPromo(e.target.value)} value={promo}>
                <option value="">Sélectionner Promo</option>
                <option value="24">Promo 24</option>
                <option value="23">Promo 23</option>
                <option value="22">Promo 22</option>
                <option value="21">Promo 21</option>
              </select>
            )}
            <button onClick={chargerUtilisateurs} disabled={gestionCotisations}>Charger Utilisateurs</button>
            <button onClick={() => setGestionCotisations(!gestionCotisations)}>
              {gestionCotisations ? "Sauvegarder et quitter" : "Gérer Cotisations"}
            </button>
          </div>

          <h2>Utilisateurs {promo && `(Promo ${promo})`}</h2>
          <div className="soifguard-grid-container">
            {utilisateurs.length > 0 ? (
              utilisateurs.map((user) => (
                <div
                  key={user.id}
                  className={`soifguard-grid-item ${selectedUser === user.id ? "soifguard-selected" : ""}`}  // Appliquer la classe de surbrillance
                  onClick={() => handleSelectUser(user.id)}  // Clic pour sélectionner/désélectionner
                >
                  <strong>{user.prenom} {user.nom_de_famille}</strong>
                  <br />
                  {categorie === "octo" && <span>Solde Octo : {user.solde_octo}€</span>}
                  {categorie === "biero" && <span>Solde Biero : {user.solde_biero}€</span>}
                  {user[`est_cotisant_${categorie}`] ? <span className="soifguard-cotisant-badge">Cotisant</span> : null}

                  {/* Gestion des cotisations */}
                  {gestionCotisations && (
                    <button
                      className={user[`est_cotisant_${categorie}`] ? "soifguard-btn-remove" : "soifguard-btn-add"}
                      onClick={(e) => {
                        e.stopPropagation();  // Empêcher le clic sur le bouton de sélectionner l'utilisateur
                        toggleCotisation(user.id, user[`est_cotisant_${categorie}`]);
                      }}
                    >
                      {user[`est_cotisant_${categorie}`] ? "Supprimer Cotisation" : "Ajouter Cotisation"}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>Aucun utilisateur chargé.</p>
            )}
          </div>
          

        </div>

        <div className={`right-section ${categorie}`}>
          <h2>Consos {categorie && `(${categorie})`}</h2>

          {/* HEADER POUR GÉRER LES CONSOS */}
          {categorie && (
            <div className="consos-header">
              <button onClick={() => setGestionConsos(!gestionConsos)}>
                {gestionConsos ? "Sauvegarder et quitter" : "Gérer les consos"}
              </button>
            </div>
          )}

          {categorie === "" ? (
            <p className="default-message">Veuillez sélectionner Octo ou Biero</p>
          ) : (
            <div className="soifguard-grid-container">
              {consos.length > 0 ? (
                consos.map((conso) => (
                  <div
                    key={conso.id}
                    className={`soifguard-grid-item ${selectedConso === conso.id ? "soifguard-selected" : ""}`}  // Appliquer la classe de surbrillance
                    onClick={() => handleSelectConso(conso.id)}  // Clic pour sélectionner/désélectionner
                  >
                    <strong>{conso.nom_conso}</strong> - {parseFloat(conso.prix).toFixed(2)}€
                    {conso.prix_cotisant !== null && <span> ({parseFloat(conso.prix_cotisant).toFixed(2)}€ cotisant)</span>}
                    
                    {/* Affichage des boutons de modification et suppression */}
                    {gestionConsos && (
                      <>
                        <button 
                          className="soifguard-btn-remove" 
                          onClick={(e) => {
                            e.stopPropagation();  // Empêcher le clic sur le bouton de sélectionner la conso
                            supprimerConso(conso.id);
                          }}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p>Aucune consommation disponible.</p>
              )}
              <div className="soifguard-grid-item soifguard-add-item" onClick={() => setIsModalOpen(true)}>+ Ajouter</div>
            </div>
          )}
        </div>



      </div>

      {/* MODAL D'AJOUT DE CONSO */}
      {isModalOpen && (
        <div className="soifguard-modal">
          <div className="soifguard-modal-content">
            <button className="soifguard-close-btn" onClick={() => setIsModalOpen(false)}>X</button>
            <h2>Ajouter une consommation</h2>
            <label>Nom de la conso :</label>
            <input type="text" value={nomConso} onChange={(e) => setNomConso(e.target.value)} />
            
            <label>Prix :</label>
            <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} />
            
            <label>Prix cotisant (optionnel) :</label>
            <input type="number" value={prixCotisant} onChange={(e) => setPrixCotisant(e.target.value)} />
            
            <button onClick={ajouterConso}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}
