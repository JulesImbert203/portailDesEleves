// App.jsx
// Gere les routes principales

import { Routes, Route, Navigate } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Direction from "./pages/Direction";
import AppPage from "./pages/AppPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/direction" element={<Direction />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
