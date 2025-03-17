// src/App.js
import React from 'react';
import Layout from './layouts/Layout';  // Importation du Layout
import Home from './components/pages/Home';  // Importation de la page Home

function App() {
  return (
    <Layout>
      <Home />  {/* Affichage du contenu spécifique de la page d'accueil */}
    </Layout>
  );
}

export default App;
