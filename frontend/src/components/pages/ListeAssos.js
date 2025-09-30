import { useEffect, useState } from 'react';
import '../../assets/styles/liste_assos.css'; 
import Asso from './Asso';
import AjouterAssociation from "./AjouterAssociation";
import { verifierSuperutilisateur } from '../../api/api_utilisateurs';
import { chargerListeAssos } from '../../api/api_associations';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/base';

export default function ListeAssos() {

  const [assos, setAssos] = useState([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate ();
  
  
  const handleClick = (asso) => {
    //selectAsso(asso); // Stocke les infos de l'asso sélectionnée
    console.log (asso)
    navigate(`/assos/get/${asso}`); // Change de composant
  };

  useEffect(() => {
    async function loadData() {
      const result = await verifierSuperutilisateur();
      setIsSuperUser(result.is_superuser);
      const data = await chargerListeAssos(); // Récupérer les images depuis Flask
      setAssos(data);
    }
    loadData();
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
                src={`${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.img}`} 
                alt={asso.nom} 
                className="liste-assos__image"
              />
              <p className="liste-assos__name">{asso.nom}</p>
            </div>
          ))}
          {isSuperUser && <div className='liste-assos__grid-item'>
            <img src='/assets/icons/plus.svg' alt="Ajouter une association" className="liste-assos__image" onClick={() => navigate("/assos/ajouter")}/>
          </div>}

        </div>
      </div>
    </div>
  );
}
