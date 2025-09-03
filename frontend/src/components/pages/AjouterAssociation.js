import React, { useState } from "react";
import { useLayout } from './../../layouts/Layout';  
import { ajouterAsso } from '../../api/api_associations';  // Importation de la fonction ajouterAsso
import Liste_Assos from "./ListeAssos" ;

function AjouterAssociation() {
  const { setCurrentComponent } = useLayout();
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [typeAssociation, setTypeAssociation] = useState("");
  const [ordreImportance, setOrdreImportance] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que les champs obligatoires sont remplis
    if (!nom.trim()) {
      setErreur("Le nom de l'association est requis.");
      return;
    }

    if (!ordreImportance.trim()) {
      setErreur("L'ordre d'importance est requis.");
      return;
    }

    // Appel à la fonction pour ajouter l'association
    const response = await ajouterAsso(nom, description, typeAssociation, ordreImportance, "", "");

    if (response.success) {
      setMessage("Association ajoutée avec succès.");
      setErreur("");
    } else {
      setMessage(response.message || "Erreur lors de l'ajout de l'association.");
      setErreur("");
    }
  };

  return (
    <div>
      <h1>Ajout d'une association</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom de l'association</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom de l'association"
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de l'association"
          />
        </div>

        <div>
          <label>Type d'association</label>
          <select
            value={typeAssociation}
            onChange={(e) => setTypeAssociation(e.target.value)}
          >
            <option value="">Sélectionner</option>
            <option value="Club BDE">Club BDE</option>
            <option value="Asso Loi 1901">Asso Loi 1901</option>
            {/* Ajoutez d'autres options si nécessaire */}
          </select>
        </div>

        <div>
          <label>Ordre d'importance</label>
          <input
            type="number"
            value={ordreImportance}
            onChange={(e) => setOrdreImportance(e.target.value)}
            placeholder="Ordre d'importance"
          />
        </div>

        <button type="submit">Ajouter l'association</button>
      </form>

      {message && <p>{message}</p>}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <button onClick={() => setCurrentComponent(<Liste_Assos />)}>Retour</button>
    </div>
  );
}

export default AjouterAssociation;
