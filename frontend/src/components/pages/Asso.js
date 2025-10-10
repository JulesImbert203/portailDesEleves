import { useEffect, useState } from 'react';
import '../../assets/styles/asso.scss';
import { chargerAsso, estUtilisateurDansAsso, ajouterContenu, changerPhoto } from './../../api/api_associations';
import AssoInfo from './PageAsso/AssoInfo';
import AssoMembres from './PageAsso/AssoMembres';
import AssoEvents from './PageAsso/AssoEvents';
import AssoPosts from './PageAsso/AssoPosts';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../../api/base';
import { Container, Row, Col, Nav, Tab, Card, Image, Button, Badge } from 'react-bootstrap';

function Asso() {
    const [asso, setAsso] = useState(null);
    const [isMembreDansAsso, setIsMembreDansAsso] = useState(null);
    const [isMembreAutorise, setIsMembreAutorise] = useState(null);

    const [activeTab, setActiveTab] = useState("info");

    const navigate = useNavigate();
    const { id } = useParams();

    const changerPhotoLogoOuBanniere = (type_photo) => {
        document.getElementById('file-upload').setAttribute("data-type", type_photo);
        document.getElementById('file-upload').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Récupère le fichier sélectionné directement
        const type_photo = event.target.getAttribute("data-type");

        if (file) {
            console.log(`Fichier sélectionné (${type_photo}) :`, file.name);
            try {
                await ajouterContenu(id, file); // Téléversement 
                await changerPhoto(id, type_photo, file.name);
                navigate(0);
            } catch (error) {
                alert(`Erreur lors du téléversement : ${error.message}`);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const assoData = await chargerAsso(id);
                const membreData = await estUtilisateurDansAsso(id);
                setAsso(assoData);
                setIsMembreDansAsso(membreData.is_membre);
                setIsMembreAutorise(membreData.autorise);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [id]);

    if (asso === null || isMembreDansAsso === null) return <p>Chargement...</p>;

    const bannerStyle = {
        backgroundImage: asso.banniere_path ? `url(${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.banniere_path})` : 'none',
    };

    return (
        <Container className="asso-container">
            {/* Champ de fichier caché */}
            <input
                type="file"
                id="file-upload"
                className="d-none" // Caché avec une classe bootstrap
                onChange={handleFileChange} // Téléverse automatiquement après sélection
            />

            <Card className="mb-3">
                <Card.Header className="asso-banner" style={bannerStyle}>
                    {/*Accessible pour modifier les photos de l'asso*/}
                    {isMembreAutorise && (
                        <Button variant="outline-light" className="position-absolute top-0 end-0 m-2" onClick={() => changerPhotoLogoOuBanniere('banniere')}>
                            <i className="bi bi-camera"></i>
                        </Button>
                    )}
                    <Image
                        className="asso-logo"
                        src={asso.img ? `${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.img}` : '/assets/icons/group.svg'}
                        alt={asso.nom}
                        roundedCircle
                    />
                    {/*Accessible pour modifier les photos de l'asso*/}
                    {isMembreAutorise && (
                        <Button variant="outline-light" className="asso-logo-edit" onClick={() => changerPhotoLogoOuBanniere('logo')}>
                            <i className="bi bi-camera"></i>
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col>
                            <h2 className='asso-nom'>{asso.nom}</h2>
                        </Col>
                        {/* Administration de l'asso */}
                        {isMembreAutorise &&
                            <Col xs="auto">
                                {isMembreDansAsso && <Badge bg="success">Vous êtes dans l'asso</Badge>}
                            </Col>}
                    </Row>
                </Card.Body>
            </Card>

            {/* Menu */}
            <Tab.Container id="asso-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="info">Infos</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="events">Événements</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="members">Membres</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="posts">Publications</Nav.Link>
                    </Nav.Item>
                </Nav>
                {/* Contenu des onglets */}
                <Tab.Content>
                    <Tab.Pane eventKey="info">
                        <AssoInfo asso_id={asso.id} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="events">
                        <AssoEvents asso_id={asso.id} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="members">
                        <AssoMembres asso_id={asso.id} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="posts">
                        <AssoPosts asso_id={asso.id} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
}

export default Asso;
