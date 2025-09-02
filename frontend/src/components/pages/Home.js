// src/pages/Home.js
import React, { useState, useEffect } from "react";
import {useLayout} from './../../layouts/Layout';  
import ListeAssos from './ListeAssos';
import AccueilSoifguard from "./AccueilSoifguard";
import { useNavigate } from "react-router-dom";
import { verifierSuperutilisateur } from "../../api/baz";

 function Home() {
  const { setCurrentComponent } = useLayout();
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  useEffect(() => {
    async function checkSuperUser() {
      const result = await verifierSuperutilisateur();
      setIsSuperUser(result.is_superuser);
    }
    checkSuperUser();
  }, []);

  return (
    <div>
      <h1>Accueil</h1>
      <button onClick={() => setCurrentComponent(<ListeAssos />)}>
        Aller vers Asso
      </button>
      <button onClick={() => setCurrentComponent(<AccueilSoifguard />)}>
        Aller vers Soifguard
      </button>
      {isSuperUser && (
        <button onClick={() => navigate("/administration")}>
          Accès administrateur
        </button>
      )}
    </div>
  );
}

export default Home;