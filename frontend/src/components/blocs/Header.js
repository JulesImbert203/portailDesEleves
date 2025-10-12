// src/components/blocs/Header.js
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../../layouts/Layout';
import { seDeconnecter } from '../../api/api_global';
import { verifierSuperutilisateur } from '../../api/api_utilisateurs';
import { useEffect, useState } from 'react';
import { verifierPermission } from '../../api/api_soifguard';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';

import '../../assets/styles/header.scss';

export default function Header() {
  const { userData } = useLayout();
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function checkSuperUser() {
      const result = await verifierSuperutilisateur();
      setIsSuperUser(result.is_superuser);
    }
    checkSuperUser();

    async function checkPermissions() {
      const octoPermission = await verifierPermission("octo");
      const bieroPermission = await verifierPermission("biero");

      if (octoPermission || bieroPermission) {
        setHasPermission(true);
      }
    }
    checkPermissions()
  }, []);

  async function handleLogout() {
    await seDeconnecter();
    navigate("/direction");  // Rediriger après déconnexion
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="global-header-header">
      <Container fluid>
        <NavDropdown title="Menu" id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => navigate("/")}>Accueil</NavDropdown.Item>
            <NavDropdown.Item onClick={() => navigate("/assos")}>Assos</NavDropdown.Item>
            <NavDropdown.Item onClick={() => navigate("/assos/planning")}>Planning associatif</NavDropdown.Item>
            <NavDropdown.Item onClick={() => navigate("/trombi")}>Trombinoscope</NavDropdown.Item>
        </NavDropdown>
        <Nav className="me-auto">
            {hasPermission && <Button variant="info" onClick={() => navigate("/soifguard")}>Soifguard</Button>}
            {isSuperUser && <Button variant="danger" onClick={() => navigate("/administration")}>Administration</Button>}
        </Nav>
        <Navbar.Brand href="#" onClick={() => navigate("/")} className="mx-auto">Portail des élèves</Navbar.Brand>
        <Nav>
            <NavDropdown title={userData ? userData.nom_utilisateur : "Chargement..."} id="basic-nav-dropdown" align="end">
                <NavDropdown.Item onClick={() => navigate(`utilisateur/${userData.id}`)}>Ma page</NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleLogout()}>Se déconnecter</NavDropdown.Item>
            </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};
