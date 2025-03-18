import React, { useEffect, useState } from 'react';
import '../../assets/styles/liste_assos.css'; 
import {useLayout} from '../../layouts/Layout'; 
import Home from './Home';
import ListeAssos from './ListeAssos';



function Asso() {

    const [currentAsso, setCurrentAsso] = useState();
    const selectedAsso = 1;
    const setAssos = 2;
    
    useEffect(() => {
    fetch("http://localhost:5000/api/associations/assos/"+String(currentAsso)) // Récupérer les images depuis Flask
      .then((response) => response.json())
      .then((data) => setAssos(data))
      .catch((error) => console.error("Erreur de chargement des images:", error));
  }, []);
  
  
  const { setCurrentComponent } = useLayout();

  return (
    <div>
        <h2>{selectedAsso.nom}</h2>
        <img src={"http://127.0.0.1:5000/upload/associations/${selectedAsso.img}"} alt={selectedAsso.nom} />
        <p>Description : {selectedAsso.description}</p>
    </div>
);
}

export default Asso;

export function selectAsso(){
    //return setCurrentAsso();
}