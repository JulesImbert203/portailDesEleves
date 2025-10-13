import React, { useEffect, useState } from 'react';
import { obtenirListeDesUtilisateurs } from '../../api/api_utilisateurs';
import { useNavigate, useParams } from 'react-router-dom';
import UserCard from '../elements/UserCard';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import '../../assets/styles/asso.scss';
import '../../assets/styles/_TrombiPromo.scss';

function TrombiPromo() {
    const [cyclesSelectionnes, setCyclesSelectionnes] = useState(["ic", "ast", "ev", "vs"]); // Les cycles sont pré-cochés
    const [utilisateurs, setUtilisateurs] = useState([]);
    const navigate = useNavigate();

    const cyclesDisponibles = ["ic", "ast", "ev", "vs", "isup"];
    const { promo } = useParams();

    // Charger les utilisateurs lorsque les cycles sélectionnés changent
    useEffect(() => {
        const chargerUtilisateurs = async () => {
            if (cyclesSelectionnes.length === 0) {
                setUtilisateurs([]); // Vide la liste si aucune case n'est cochée
                return;
            }
            const data = await obtenirListeDesUtilisateurs(promo, cyclesSelectionnes);
            setUtilisateurs(data);
        };
        chargerUtilisateurs();
    }, [promo, cyclesSelectionnes]);

    const toggleCycle = (cycle) => {
        setCyclesSelectionnes(prev =>
            prev.includes(cycle) ? prev.filter(c => c !== cycle) : [...prev, cycle]
        );
    };

    return (
        <Container className="py-4 trombi-promo-page">
            <Button variant="outline-secondary" onClick={() => navigate("/trombi")} className="mb-3">
                Retour
            </Button>
            <h1>Promotion {promo}</h1>
            <Form className="mb-4">
                <Row>
                    <Col>
                        {cyclesDisponibles.map(cycle => (
                            <Form.Check
                                inline
                                key={cycle}
                                type="checkbox"
                                id={`cycle-${cycle}`}
                                label={cycle.toUpperCase()}
                                value={cycle}
                                checked={cyclesSelectionnes.includes(cycle)}
                                onChange={() => toggleCycle(cycle)}
                            />
                        ))}
                    </Col>
                </Row>
            </Form>

            {cyclesSelectionnes.length > 0 ? (
                <div className="member-grid">
                    {utilisateurs.map(user => (
                        <UserCard user={user} key={user.id} isGestion={false} isModifying={false} />
                    ))}
                </div>
            ) : (
                <p>Aucun cycle sélectionné.</p>
            )}
        </Container>
    );
}

export default TrombiPromo;
