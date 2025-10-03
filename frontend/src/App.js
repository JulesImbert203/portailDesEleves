// App.jsx
// Gere les routes principales

import { Routes, Route, Navigate } from "react-router-dom";
import Soifguard from "./pages/Soifguard";
import Admin from "./pages/Admin";
import ListeAssos from "./components/pages/ListeAssos";
import Home from "./components/pages/Home";
import AccueilSoifguard from "./components/pages/AccueilSoifguard";
import Asso from "./components/pages/Asso";
import Trombi from "./components/pages/Trombi";
import TrombiPromo from "./components/pages/TrombiPromo";
import PlanningAsso from "./components/pages/PlanningAsso";
import ProposerSondage from "./components/pages/ProposerSondage";
import GererSondages from "./components/pages/GererSondages";
import PageUtilisateur from "./components/pages/PageUtilisateur";
import AjouterAssociation from "./components/pages/AjouterAssociation";
import { LayoutProvider } from "./layouts/Layout";
import FormulaireConnexion from "./components/FormulaireConnexion";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<FormulaireConnexion />}/>
      <Route path="/" element={<LayoutProvider />}>
        <Route path="/" element={<Home />} />
        <Route path="assos">
          <Route path="" element={<ListeAssos />} />
          <Route path="get/:id" element={<Asso />} />
          <Route path="planning" element={<PlanningAsso />} />
          <Route path="ajouter" element={<AjouterAssociation />} />
        </Route>
        <Route path="trombi">
          <Route path="" element={<Trombi />} />
          <Route path="get/:promo" element={<TrombiPromo />} />
        </Route>
        <Route path="sondage">
          <Route path="proposer" element={<ProposerSondage />} />
          <Route path="gerer" element={<GererSondages />} />
        </Route>
        <Route path="utilisateur">
          <Route path=":id" element={<PageUtilisateur />} />
        </Route>
      </Route>
      <Route path="soifguard">
        <Route path="accueil" element={<AccueilSoifguard />} />
        <Route path="" element={<Soifguard />} />
      </Route>
      <Route path="/administration" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
