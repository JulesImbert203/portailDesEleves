import { useEffect, useState } from 'react';
import '../../assets/styles/asso.scss';
import { chargerAsso, estUtilisateurDansAsso, ajouterContenu, changerPhoto } from './../../api/api_associations';
import AssoInfo from './PageAsso/AssoInfo';
import AssoMembres from './PageAsso/AssoMembres';
import AssoEvents from './PageAsso/AssoEvents';
import AssoPosts from './PageAsso/AssoPosts';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../../api/base';
import { Container, Row, Col, Nav, Tab, Image, Button, Badge } from 'react-bootstrap';

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
        const file = event.target.files[0];
        const type_photo = event.target.getAttribute("data-type");

        if (file) {
            try {
                await ajouterContenu(id, file);
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
        backgroundColor: 'lightgrey'
    };

    return (
        <Container>
            <input
                type="file"
                id="file-upload"
                className="d-none"
                onChange={handleFileChange}
                data-type=""
            />
            <Row>
                <Col xs={12} className="p-0">
                    <div className="position-relative">
                        <div className="asso-banner rounded-top" style={bannerStyle}>
                            {isMembreAutorise && (
                                <Button variant="outline-light" className="position-absolute top-0 end-0 m-2" onClick={() => changerPhotoLogoOuBanniere('banniere')}>
                                    <i className="bi bi-camera"></i>
                                </Button>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="bg-light p-3 rounded-bottom">
                <Row>
                    <Col md={3} className="text-center text-md-start">
                        <div className="position-relative d-inline-block">
                            <Image
                                src={asso.img ? `${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.img}` : '/assets/icons/group.svg'}
                                alt={asso.nom}
                                className="asso-logo rounded-3"
                            />
                            {isMembreAutorise && (
                                <div className="position-absolute top-50 start-50 translate-middle opacity-75">
                                    <Button variant="link" className="text-dark" onClick={() => changerPhotoLogoOuBanniere('logo')}>
                                        <i className="bi bi-camera fs-3"></i>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Col>
                    <Col md={9} className="d-flex align-items-center justify-content-center justify-content-md-start mt-3 mt-md-0">
                        <h2>{asso.nom}</h2>
                        {isMembreAutorise && isMembreDansAsso && <Badge bg="success" className="ms-3">Vous êtes dans l'asso</Badge>}
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col xs={12}>
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
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default Asso;