import React, { useEffect, useState } from 'react';
import '../../assets/styles/liste_assos.css'; 
import {useLayout} from '../../layouts/Layout'; 
import Home from './Home';
import { useNavigate } from "react-router-dom";
import Asso from './Asso';
import {verifierSuperutilisateur} from "../../api";
import AjouterAssociation from "./AjouterAssociation";

function Liste_Assos() {

  const [assos, setAssos] = useState([]);
  const { setCurrentComponent } = useLayout();
  const [isSuperUser, setIsSuperUser] = useState(false);
  
  
  const handleClick = (asso) => {
    //selectAsso(asso); // Stocke les infos de l'asso sélectionnée
    setCurrentComponent(<Asso id = {asso}/>); // Change de composant
  };

  useEffect(() => {
    async function checkSuperUser() {
      const result = await verifierSuperutilisateur();
      setIsSuperUser(result.is_superuser);
    }
    checkSuperUser();
    fetch("http://localhost:5000/api/associations/assos") // Récupérer les images depuis Flask
      .then((response) => response.json())
      .then((data) => setAssos(data))
      .catch((error) => console.error("Erreur de chargement des images:", error));
  }, []);

  return (
    <div className="liste-assos">
      <h1 className="liste-assos__title">Associations</h1>
      <p className="liste-assos__description">Ici tu peux retrouver toutes les associations des Mines</p>
      <div className="liste-assos__grid">
        <div className="liste-assos__grid-container">
          {assos.map((asso) => (
            <div 
              key={asso.id} 
              className="liste-assos__grid-item" 
              onClick={() => handleClick(asso.id)}
            >
              <img 
                src={`http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.img}`} 
                alt={asso.nom} 
                className="liste-assos__image"
              />
              <p className="liste-assos__name">{asso.nom}</p>
            </div>
          ))}
          {isSuperUser && <div className='liste-assos__grid-item'>
            <img src='/assets/icons/plus.svg' alt="Ajouter une association" className="liste-assos__image" onClick={() => setCurrentComponent(<AjouterAssociation/>)}/>
          </div>}

        </div>
      </div>
    </div>
  );
}

export default Liste_Assos;
