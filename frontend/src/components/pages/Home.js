// src/pages/Home.js
import React, { useState } from "react";
import {useLayout} from './../../layouts/Layout';  
import Asso from './Asso'
import '../../assets/styles/home.css'; 
 // Import des styles spécifiques à la page Home
 function Home() {
  const { setCurrentComponent } = useLayout();

  return (
    <div>
      <h1>Accueil</h1>
      <button onClick={() => setCurrentComponent(<Asso />)}>
        Aller vers Asso
      </button>
    </div>
  );
}

export default Home;
