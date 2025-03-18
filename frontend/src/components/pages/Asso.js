import React, { useEffect, useState } from 'react';
import '../../assets/styles/asso.css'; 



function Asso() {

  const [assos, setAssos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/assos") // Récupérer les images depuis Flask
      .then((response) => response.json())
      .then((data) => setAssos(data))
      .catch((error) => console.error("Erreur de chargement des images:", error));
  }, []);

    return (
      <div className="assos">
        <h1>Associations</h1>
        <p>Ici tu peux retrouver toutes les associations des Mines</p>
        <div>
          <div className="grid-container">
        {assos.map((asso) => (
            <div key={asso.id} className="grid-item">
              <img src={asso.img} alt={asso.nom} />
              <p>{asso.nom}</p>
            </div>
            ))}
          </div>
        </div>
      </div>
      



      
    );
  }


  export default Asso;