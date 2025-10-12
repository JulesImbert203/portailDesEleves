import { useEffect, useState } from 'react';
import { obtenirDataUser } from '../../api/api_utilisateurs';

import { useLayout } from '../../layouts/Layout';
import TabInfo from './PageUtilisateur/Info';
import TabAsso from './PageUtilisateur/Asso';
import TabQuestions from './PageUtilisateur/Question';
import { useParams } from 'react-router-dom';
import { verifierSuperutilisateur } from "../../api/api_utilisateurs";
import { BASE_URL } from '../../api/base';
import { Container, Row, Col, Card, Image, Nav, Tab } from 'react-bootstrap';

function PageUtilisateur() {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState({});
    const [activeTab, setActiveTab] = useState("info");
    const { userData } = useLayout();
    const [autoriseAModifier, setAutoriseAModifier] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        setAutoriseAModifier(userData.id == id || userData.is_superuser);
    }, [id, userData]);

    useEffect(() => {// Obtention des données utilisateur à afficher
        const fetchData = async () => {
            var data = await obtenirDataUser(id);
            setDonneesUtilisateur({
                prenom: data.prenom,
                nom: data.nom
            });
        };
        fetchData();
    }, [id]);

    if (donneesUtilisateur === null) { return (<p>Chargement...</p>); }

    return (
        <Container className="py-4">
            <Card>
                <Card.Header 
                    style={{
                        backgroundImage: `url(${BASE_URL}/upload/utilisateurs/minesvert.jpg)`,
                        height: '170px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <Image 
                        src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`} 
                        alt={donneesUtilisateur.nom_utilisateur} 
                        rounded 
                        style={{
                            position: 'absolute',
                            top: 'calc(170px * 0.2)',
                            right: 'calc(170px * 0.2)',
                            width: 'calc(170px * 0.75)',
                            border: '5px solid white'
                        }}
                    />
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <h2>{donneesUtilisateur.prenom} {donneesUtilisateur.nom}</h2>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="my-3">
                    <Nav.Item>
                        <Nav.Link eventKey="info">Infos</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="assos">Associations</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="questions">Questions du portail</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="info">
                        <TabInfo id={id} donneesUtilisateur={userData} autoriseAModifier={autoriseAModifier} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="assos">
                        <TabAsso id={id} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="questions">
                        <TabQuestions id={id} autoriseAModifier={autoriseAModifier} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
}
export default PageUtilisateur;