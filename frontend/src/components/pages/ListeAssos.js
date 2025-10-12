import { useEffect, useState } from 'react';
import { verifierSuperutilisateur } from '../../api/api_utilisateurs';
import { chargerListeAssos } from '../../api/api_associations';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/base';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function ListeAssos() {

  const [assos, setAssos] = useState([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate ();
  
  
  const handleClick = (asso) => {
    //selectAsso(asso); // Stocke les infos de l'asso sélectionnée
    navigate(`/assos/get/${asso}`); // Change de composant
  };

  useEffect(() => {
    async function loadData() {
      const result = await verifierSuperutilisateur();
      setIsSuperUser(result.is_superuser);
      const data = await chargerListeAssos(); // Récupérer les images depuis Flask
      setAssos(data);
    }
    loadData();
  }, []);

  return (
    <Container className="py-4">
        <h1 className="mb-3">Associations</h1>
        <p className="text-muted">Ici tu peux retrouver toutes les associations des Mines</p>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 justify-content-center">
            {assos.map((asso) => (
                <Col key={asso.id}>
                    <Card 
                        className="h-100 text-center" 
                        onClick={() => handleClick(asso.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card.Img 
                            variant="top" 
                            src={`${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.img}`} 
                            alt={asso.nom} 
                            style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                            <Card.Title>{asso.nom}</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
            {isSuperUser && (
                <Col>
                    <Card 
                        className="h-100 text-center" 
                        onClick={() => navigate("/assos/ajouter")}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            <Button variant="outline-primary">
                                <img src='/assets/icons/plus.svg' alt="Ajouter une association" style={{ width: "50px" }}/>
                            </Button>
                            <Card.Title className="mt-2">Ajouter</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            )}
        </Row>
    </Container>
  );
}