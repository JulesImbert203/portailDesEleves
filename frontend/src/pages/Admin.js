import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenirIdUserParNom, obtenirPermissionsSoifguard, ajouterPermission, ajouterAsso } from "../api"; // Assurez-vous que le chemin est correct

export default function Admin() {
  const navigate = useNavigate();
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [asso, setAsso] = useState("octo"); // Valeur par défaut
  const [permissions, setPermissions] = useState([]);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [nouv_asso, setnouv_asso] = useState(["","","",null,""]);

  // Récupérer toutes les permissions à afficher
  const chargerPermissions = async () => {
    const data = await obtenirPermissionsSoifguard();
    if (data && Array.isArray(data)) {
      setPermissions(data);
    }
  };

  // Ajouter une permission
  const handleAjouterPermission = async () => {
    if (!nomUtilisateur.trim()) {
      setErreur("Veuillez entrer un nom d'utilisateur.");
      return;
    }

    // Rechercher l'ID de l'utilisateur par son nom
    const data = await obtenirIdUserParNom(nomUtilisateur);

    if (!data.success) {
      setErreur("Utilisateur introuvable.");
      setMessage("");
      return;
    }

    // Utilisateur trouvé, on peut ajouter la permission
    const idUtilisateur = data.id_utilisateur;

    const response = await ajouterPermission(idUtilisateur, asso);
    if (response.success) {
      setMessage("Permission ajoutée avec succès.");
      setErreur(""); // Réinitialiser les erreurs
      // Recharger les permissions après ajout
      chargerPermissions();
    } else {
      setMessage(response.message || "Erreur lors de l'ajout de la permission.");
      setErreur(""); // Réinitialiser les erreurs
    }
  };

  function change_nouvasso(e, index) {

    const list = [...nouv_asso];
    list[index] = e;
    setnouv_asso(list);
  }

  const handleAjouterAssociation = async () => {
      const nom = nouv_asso[0];
      const description = nouv_asso[1];
      const type = nouv_asso[2];
      const img = nouv_asso[3];
      const ordre = nouv_asso[4];

      if (!nom.trim()) {
        setErreur("Veuillez entrer un nom d'association.");
        return;
      }
      if (!description.trim()) {
        setErreur("Veuillez entrer une description.");
        return;
      }
      if (!type.trim()) {
        setErreur("Veuillez selectionner un type d'association.");
        return;
      }
      if (!ordre.trim()) {
        setErreur("Veuillez entrer un ordre.");
        return;
      }
      const formData = new FormData();
      formData.append("file", img);
      
      const response = await ajouterAsso(nom, description, type, formData,img.name, ordre);
    if (response.success) {
      setMessage("Association ajoutée avec succès.");
      setErreur(""); // Réinitialiser les erreurs
      // Recharger les permissions après ajout
      
    } else {
      setMessage(response.message || "Erreur lors de l'ajout de l'asso.");
      setErreur(""); // Réinitialiser les erreurs
    }

   };

  // Charger les permissions au démarrage du composant
  useEffect(() => {
    chargerPermissions();
  }, []);

  return (
    <div>
      <h1>Menu administrateur</h1>

      <div>
        <h2>Ajouter une permission</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={nomUtilisateur}
            onChange={(e) => setNomUtilisateur(e.target.value)}
          />
          <select
            value={asso}
            onChange={(e) => setAsso(e.target.value)}
          >
            <option value="octo">Octo</option>
            <option value="biero">Biero</option>
            {/* Ajoutez d'autres options si nécessaire */}
          </select>
          <button onClick={handleAjouterPermission}>Ajouter</button>
        </div>
        {message && <p>{message}</p>}
        {erreur && <p style={{ color: "red" }}>{erreur}</p>}
      </div>

      <div>
        <h2>Utilisateurs avec leurs permissions</h2>
        <table>
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length > 0 ? (
              permissions.map((utilisateur, index) => (
                <tr key={index}>
                  <td>{utilisateur.nom_utilisateur}</td>
                  <td>{utilisateur.assos}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">Aucun utilisateur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div> 
          <h2>Ajouter une association</h2>
          <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Nom de l'association"
            //value={nomUtilisateur}
            onChange={(e) => change_nouvasso(e.target.value, 0)}
          />
          <input
            type="text"
            placeholder="Description"
            //value={description}
            onChange={(e) => change_nouvasso(e.target.value, 1)}
          />
          <select
            //value={type}
            onChange={(e) => change_nouvasso(e.target.value, 2)}
          >
            <option value="">Selectionner</option>
            <option value="Club BDE">Club BDE</option>
            <option value="Asso Loi 1901">Asso Loi 1901</option>
            {/* Ajoutez d'autres options si nécessaire */}
          </select>
          <input
            type="file"
            placeholder="file"
            accept=".png,.jpg,.jpeg,.gif,.pdf,.txt"
            //value={logo_path}
            onChange={(e) => change_nouvasso(e.target.files[0], 3)}
          />

          <input
            type="number"
            placeholder="Ordre importance"
            //value={ordre}
            onChange={(e) => change_nouvasso(e.target.value, 4)}
          />
          <button onClick={handleAjouterAssociation}>Ajouter</button>
        </div>
        {message && <p>{message}</p>}
        {erreur && <p style={{ color: "red" }}>{erreur}</p>}
      </div>
      

      <button onClick={() => navigate("/direction")}>Retour au portail</button>
    </div>
  );
}
