import { useState, useEffect } from "react";
import { useLayout } from "../../layouts/Layout";  
import Home from "./Home";
import { useNavigate } from "react-router-dom";
import { verifierPermission } from "../../api/api_soifguard";

function AccueilSoifguard() {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      const octoPermission = await verifierPermission("octo");
      const bieroPermission = await verifierPermission("biero");

      if (octoPermission || bieroPermission) {
        setHasPermission(true);
      }
    }

    checkPermissions();
  }, []);

  return (
    <div>
      <h1>Soifguard</h1>
      <p>Soifguard est le logiciel qui gère les comptes de l'octo et de la biéro</p>

      {hasPermission ? (
        <button onClick={() => navigate("/soifguard")}>
          Lancer SoifGuard
        </button>
      ) : (
        <p>Vous n'avez pas les permissions nécessaires pour accéder à Soifguard.</p>
      )}

      <button onClick={() => navigate("/")}>
        Retour
      </button>
    </div>
  );
}

export default AccueilSoifguard;
