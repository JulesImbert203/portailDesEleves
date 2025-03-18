// src/components/bloc/Header.js
import React from 'react';
import { useLayout } from '../../layouts/Layout';
import Asso from '../pages/Asso'
import Home from '../pages/Home';

function Header() {
  const { setCurrentComponent } = useLayout();
  return (
    <header>
      <h1>Portail des Mineurs</h1>
      <select onChange={(e) => {
        const selectedPage = e.target.value;
        if (selectedPage === "home") setCurrentComponent(<Home />);
        else if (selectedPage === "asso") setCurrentComponent(<Asso />);

      }}>
        <option value="home">Accueil</option>
        <option value="asso">Association</option>

      </select>
    </header>
  );
}

export default Header;
