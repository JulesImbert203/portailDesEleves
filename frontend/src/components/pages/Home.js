// src/pages/ListeAssos.js
import React, { useState } from "react";
import {useLayout} from './../../layouts/Layout';  
import ListeAssos from './ListeAssos';

 function Home() {
  const { setCurrentComponent } = useLayout();

  return (
    <div>
      <h1>Accueil</h1>
      <button onClick={() => setCurrentComponent(<ListeAssos />)}>
        Aller vers Asso
      </button>
    </div>
  );
}

export default Home;