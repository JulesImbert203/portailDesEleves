// src/components/blocs/Header.js
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../../layouts/Layout';
import { seDeconnecter } from '../../api/api_global';
import { verifierSuperutilisateur } from '../../api/api_utilisateurs';
import { useEffect, useState } from 'react';
import { verifierPermission } from '../../api/api_soifguard';
import { Container, Row, Col, Dropdown, Button } from 'react-bootstrap';

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
    <Container fluid className="global-header-header">
      <Row className="align-items-center">
        <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-menu">
              Menu
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate("/")}>Accueil</Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("/assos")}>Assos</Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("/assos/planning")}>Planning associatif</Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("/trombi")}>Trombinoscope</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        {hasPermission && <Col xs="auto"><Button variant="info" onClick={() => navigate("/soifguard")}>Soifguard</Button></Col>}
        {isSuperUser && <Col xs="auto"><Button variant="danger" onClick={() => navigate("/administration")}>Administration</Button></Col>}

        <Col className="text-center">
          <h1 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Portail des élèves</h1>
        </Col>

        <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-user">
              {userData ? userData.nom_utilisateur : "Chargement..."}
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => navigate(`utilisateur/${userData.id}`)}>Ma page</Dropdown.Item>
              <Dropdown.Item onClick={() => handleLogout()}>Se déconnecter</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
    </Container>
  );
};
