// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { verifierSuperutilisateur } from "../../api/api_utilisateurs";

 function Home() {
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
      <button onClick={() => navigate("/assos")}>
        Aller vers Asso
      </button>
      <button onClick={() => navigate("/soifguard/accueil")}>
        Aller vers Soifguard
      </button>
      {isSuperUser && (
        <button onClick={() => navigate("/administration")}>
          Accès administrateur
        </button>
      )}
      <Outlet />
    </div>
  );
}

export default Home;